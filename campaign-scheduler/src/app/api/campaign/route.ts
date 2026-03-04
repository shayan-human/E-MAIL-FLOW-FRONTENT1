import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@insforge/nextjs/server";
import { CampaignPayloadSchema } from "@/lib/validations/campaign";
import { globalRateLimiter } from "@/lib/rate-limit";
import { insforge } from "@/lib/insforge";

// Simple memory store for idempotency keys
const processedIdempotencyKeys = new Set<string>();

export async function POST(req: Request) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Rate Limiting (by IP)
        const headersList = await headers();
        const forwardedFor = headersList.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

        try {
            await globalRateLimiter.check(10, ip);
        } catch {
            return NextResponse.json(
                { error: "Too many requests. Please wait a minute." },
                { status: 429 }
            );
        }

        // 3. Payload Validation
        const body = await req.json();
        const validationResult = CampaignPayloadSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation Failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }
        const validatedData = validationResult.data;

        // 4. Idempotency Check
        const { idempotencyKey, subject, body: emailBody, mappedLeads, selectedAccountIds, ...campaignConfig } = validatedData;
        if (processedIdempotencyKeys.has(idempotencyKey)) {
            return NextResponse.json(
                { message: "Campaign already processing.", data: { idempotencyKey } },
                { status: 202 }
            );
        }
        processedIdempotencyKeys.add(idempotencyKey);
        setTimeout(() => processedIdempotencyKeys.delete(idempotencyKey), 5 * 60 * 1000);

        // 5. Save Campaign to InsForge
        const campaignName = `Campaign-${idempotencyKey.slice(0, 8)}`;

        const { data: newCampaign, error: campaignError } = await insforge.database
            .from("campaigns")
            .insert([{
                user_id: user.id,
                name: campaignName,
                subject,
                body: emailBody,
                total_leads: mappedLeads.length,
                status: "RUNNING",
            }])
            .select("id")
            .single();

        if (campaignError || !newCampaign) {
            console.error("[Campaign Create Error]:", campaignError);
            throw new Error("Failed to create campaign in database");
        }

        const campaignId = newCampaign.id;

        // 6. Link sender accounts
        const accountLinks = selectedAccountIds.map(accId => ({
            campaign_id: campaignId,
            sender_account_id: accId,
        }));

        const { error: linkError } = await insforge.database
            .from("campaign_accounts")
            .insert(accountLinks);

        if (linkError) {
            console.error("[Campaign Account Link Error]:", linkError);
        }

        // 7. Insert leads
        const { data: senderAccounts } = await insforge.database
            .from("sender_accounts")
            .select("id, email")
            .in("id", selectedAccountIds);

        const senderMapById: Record<string, string> = {};
        (senderAccounts || []).forEach(acc => {
            senderMapById[acc.id] = acc.email;
        });

        const verifiedAccountsCount = selectedAccountIds.length;

        const leadsToInsert = mappedLeads.map((lead, i) => {
            const accId = selectedAccountIds[i % verifiedAccountsCount];
            return {
                campaign_id: campaignId,
                email: lead.email,
                first_name: lead.firstName || null,
                status: "PENDING",
                sender_account_id: accId,
                sender_account_email: senderMapById[accId] || null,
            };
        });

        const { error: leadsError } = await insforge.database
            .from("leads")
            .insert(leadsToInsert);

        if (leadsError) {
            console.error("[Leads Insert Error]:", leadsError);
        }

        // 8. Try to dispatch to n8n (non-blocking)
        const n8nBaseUrl = process.env.N8N_BASE_URL;
        let dispatched = false;

        if (n8nBaseUrl) {
            try {
                const webhookUrl = `${n8nBaseUrl}/webhook/campaign-dispatch`;

                const { data: senderAccountsData } = await insforge.database
                    .from("sender_accounts")
                    .select("id, email, google_access_token, google_refresh_token")
                    .in("id", selectedAccountIds)
                    .eq("is_active", true);

                const senderAccountsToken = Array.isArray(senderAccountsData) ? senderAccountsData : [];
                const verifiedAccounts = senderAccountsToken.filter((a: any) => a.google_access_token);

                const sendingMode = campaignConfig.sendingMode || "round-robin";

                // Assign leads to accounts based on sending mode
                const mappedLeadsWithAccounts = mappedLeads.map((lead, i) => {
                    let acc;
                    if (sendingMode === "sequential") {
                        const batchSize = Math.ceil(mappedLeads.length / verifiedAccounts.length);
                        const accountIndex = Math.min(
                            Math.floor(i / batchSize),
                            verifiedAccounts.length - 1
                        );
                        acc = verifiedAccounts[accountIndex];
                    } else {
                        acc = verifiedAccounts[i % verifiedAccounts.length];
                    }
                    return {
                        ...lead,
                        assignedSenderEmail: acc?.email || "",
                        assignedGoogleToken: acc?.google_access_token || "",
                    };
                });

                const dispatchResponse = await fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        campaignId,
                        idempotencyKey,
                        campaignName,
                        subject,
                        body: emailBody,
                        leads: mappedLeadsWithAccounts,
                        sendingMode,
                        scheduling: campaignConfig,
                    }),
                    signal: AbortSignal.timeout(10000),
                });

                dispatched = dispatchResponse.ok;

                if (dispatched) {
                    const { error: updateError } = await insforge.database
                        .from("leads")
                        .update({ status: "SENT", sent_at: new Date().toISOString() })
                        .eq("campaign_id", campaignId)
                        .eq("status", "PENDING");

                    if (!updateError) {
                        await insforge.database
                            .from("campaigns")
                            .update({ status: "COMPLETED" })
                            .eq("id", campaignId);
                    }
                }
            } catch (n8nErr) {
                console.warn("[n8n dispatch skipped]:", n8nErr);
            }
        }

        return NextResponse.json({
            message: dispatched
                ? "Campaign dispatched to n8n successfully"
                : "Campaign created and saved. (n8n dispatch unavailable — campaign is ready for manual trigger)",
            data: { campaignId, idempotencyKey, dispatched },
        });

    } catch (error: unknown) {
        console.error("[Campaign API Error]:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

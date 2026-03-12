import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";
import { decrypt } from "@/lib/encryption";
import { CampaignPayloadSchema } from "@/lib/validations/campaign";
import { globalRateLimiter } from "@/lib/rate-limit";

// Simple memory store for idempotency keys
const processedIdempotencyKeys = new Set<string>();

function replacePlaceholders(template: string, lead: any) {
    if (!template) return "";
    const data = {
        firstName: lead.firstName || lead.first_name || "",
        lastName: lead.lastName || lead.last_name || "",
        fullName: lead.fullName || lead.full_name || "",
        businessName: lead.businessName || lead.business_name || "",
        website: lead.website || "",
        email: lead.email || ""
    };

    return template
        .replace(/\{\{\s*firstName\s*\}\}/gi, data.firstName)
        .replace(/\{\{\s*first\s*name\s*\}\}/gi, data.firstName)
        .replace(/\{\{\s*lastName\s*\}\}/gi, data.lastName)
        .replace(/\{\{\s*last\s*name\s*\}\}/gi, data.lastName)
        .replace(/\{\{\s*fullName\s*\}\}/gi, data.fullName)
        .replace(/\{\{\s*full\s*name\s*\}\}/gi, data.fullName)
        .replace(/\{\{\s*businessName\s*\}\}/gi, data.businessName)
        .replace(/\{\{\s*business\s*name\s*\}\}/gi, data.businessName)
        .replace(/\{\{\s*website\s*\}\}/gi, data.website)
        .replace(/\{\{\s*email\s*\}\}/gi, data.email);
}

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
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            const mappedLeadsErrors = fieldErrors.mappedLeads;

            let message = "The campaign data provided is invalid.";
            if (mappedLeadsErrors && mappedLeadsErrors.length > 0) {
                message = `Lead Validation Failed: ${mappedLeadsErrors[0]}`;
            } else {
                // Check for other common fields
                const firstError = Object.entries(fieldErrors).find(([_, errs]) => errs && errs.length > 0);
                if (firstError) {
                    message = `Validation Error (${firstError[0]}): ${firstError[1]?.[0]}`;
                }
            }

            console.warn("[Campaign Validation Failed]:", JSON.stringify(validationResult.error.format(), null, 2));

            return NextResponse.json(
                {
                    error: "Validation Failed",
                    message,
                    details: fieldErrors,
                },
                { status: 400 }
            );
        }
        const validatedData = validationResult.data;

        // 4. Idempotency Check
        const { idempotencyKey, subject, body: emailBody, mappedLeads, selectedAccountIds, senderDisplayName, ...campaignConfig } = validatedData;
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
        const insforge = await getInsforgeClient();

        const { data: newCampaign, error: campaignError } = await insforge.database
            .from("campaigns")
            .insert([{
                user_id: user.id,
                name: campaignName,
                subject,
                body: emailBody,
                total_leads: mappedLeads.length,
                status: "RUNNING",
                min_delay: campaignConfig.minDelay || 5,
                max_delay: campaignConfig.maxDelay || 15,
                sender_display_name: senderDisplayName || null,
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

        const sendingMode = campaignConfig.sendingMode || "round-robin";
        const verifiedAccountsCount = selectedAccountIds.length;

        const basePerAccount = Math.floor(mappedLeads.length / verifiedAccountsCount);
        const remainder = mappedLeads.length % verifiedAccountsCount;

        const leadsToInsert = mappedLeads.map((lead, i) => {
            let accId;
            if (sendingMode === "sequential") {
                // Calculate batch sizes with remainder distributed to first accounts
                const getAccountIndex = (leadIndex: number) => {
                    let currentLimit = 0;
                    for (let j = 0; j < verifiedAccountsCount; j++) {
                        const accountLoad = basePerAccount + (j < remainder ? 1 : 0);
                        currentLimit += accountLoad;
                        if (leadIndex < currentLimit) return j;
                    }
                    return verifiedAccountsCount - 1;
                };
                accId = selectedAccountIds[getAccountIndex(i)];
            } else {
                // Default: Round-Robin (matches the same even distribution logic by nature of modulo)
                accId = selectedAccountIds[i % verifiedAccountsCount];
            }

            const personalizedSubject = replacePlaceholders(subject, lead);
            const personalizedBody = replacePlaceholders(emailBody, lead);

            return {
                campaign_id: campaignId,
                email: lead.email,
                first_name: lead.firstName || null,
                last_name: lead.lastName || null,
                full_name: lead.fullName || null,
                business_name: lead.businessName || null,
                website: lead.website || null,
                personalized_subject: personalizedSubject,
                personalized_body: personalizedBody,
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

        // 8. Trigger Backend for immediate processing
        const backendUrl = process.env.CAMPAIGN_BACKEND_URL || 'http://localhost:3000';
        let triggered = false;

        try {
            const triggerResponse = await fetch(`${backendUrl}/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            triggered = triggerResponse.ok;
        } catch (triggerErr) {
            console.warn("[Backend trigger failed]:", triggerErr);
        }

        return NextResponse.json({
            message: triggered
                ? "Campaign created and backend triggered successfully."
                : "Campaign created and saved. Manual trigger may be required.",
            data: { campaignId, idempotencyKey, triggered },
        });

    } catch (error: unknown) {
        console.error("[Campaign API Error]:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";
import { encrypt } from "@/lib/encryption";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insforge = await getInsforgeClient();
        const { data: accounts, error } = await insforge.database
            .from("sender_accounts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch emails sent today per account
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: sentTodayData } = await insforge.database
            .from("leads")
            .select("sender_account_id, status")
            .gte("sent_at", startOfDay.toISOString())
            .in("status", ["SENT", "REPLIED"]);

        const sentTodayMap: Record<string, number> = {};
        sentTodayData?.forEach(lead => {
            if (lead.sender_account_id) {
                sentTodayMap[lead.sender_account_id] = (sentTodayMap[lead.sender_account_id] || 0) + 1;
            }
        });

        const accountsWithStats = (accounts || []).map(acc => ({
            ...acc,
            google_access_token: "••••••••", // Sanitize
            google_refresh_token: acc.google_refresh_token ? "••••••••" : null, // Sanitize
            sent_today: sentTodayMap[acc.id] || 0,
            last_synced_at: acc.created_at,
        }));

        return NextResponse.json({ data: accountsWithStats });
    } catch (error) {
        console.error("[GET Accounts API Error]:", error);
        return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { email, google_access_token, google_refresh_token } = body;

        if (!email || !google_access_token) {
            return NextResponse.json(
                { error: "Missing email or access token" },
                { status: 400 }
            );
        }

        // Check if account already exists
        const insforge = await getInsforgeClient();
        const { data: existing } = await insforge.database
            .from("sender_accounts")
            .select("id, user_id")
            .eq("email", email)
            .maybeSingle();

        if (existing) {
            if (existing.user_id !== user.id) {
                return NextResponse.json({ error: "Email already connected by another user" }, { status: 409 });
            }

            // Update existing account
            const { data: updated, error } = await insforge.database
                .from("sender_accounts")
                .update({
                    google_access_token: encrypt(google_access_token),
                    google_refresh_token: google_refresh_token ? encrypt(google_refresh_token) : null,
                    is_active: true,
                })
                .eq("id", existing.id)
                .select()
                .single();

            if (error) throw error;

            return NextResponse.json(
                { message: "Account updated", data: updated },
                { status: 200 }
            );
        }

        // Create new sender account
        const { data: created, error } = await insforge.database
            .from("sender_accounts")
            .insert([{
                user_id: user.id,
                email,
                google_access_token: encrypt(google_access_token),
                google_refresh_token: google_refresh_token ? encrypt(google_refresh_token) : null,
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(
            { message: "Account connected successfully", data: created },
            { status: 201 }
        );

    } catch (error) {
        console.error("[POST Accounts API Error]:", error);
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }
}

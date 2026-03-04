import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { auth } from "@insforge/nextjs/server";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: accounts, error } = await insforge.database
            .from("sender_accounts")
            .select("*")
            .eq("user_id", user.id)
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
                    google_access_token,
                    google_refresh_token: google_refresh_token || null,
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
                google_access_token,
                google_refresh_token: google_refresh_token || null,
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

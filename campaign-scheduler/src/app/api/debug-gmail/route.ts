import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";
import { decrypt } from "@/lib/encryption";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const insforge = await getInsforgeClient();
        const { data: accounts } = await insforge
            .from("sender_accounts")
            .select("*");

        if (!accounts || accounts.length === 0) return NextResponse.json({ error: "No accounts" });

        const debugInfo: any[] = [];

        for (const account of accounts) {
            const url = "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:demgrowonline@gmail.com";
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${decrypt(account.google_access_token)}` }
            });
            const data = await res.json();
            debugInfo.push({
                email: account.email,
                messageCount: data.messages?.length || 0,
                messages: data.messages || []
            });
        }

        return NextResponse.json({ debugInfo });
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}

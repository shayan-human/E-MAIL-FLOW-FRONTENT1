import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insforge = await getInsforgeClient();

        // Get all unique emails from leads across all user's campaigns
        const { data: existingLeads, error: leadsError } = await insforge.database
            .from('leads')
            .select('email')
            .eq('sender_account_email', user.email);

        // Get all blocked emails
        const { data: blockedLeads, error: blockedError } = await insforge.database
            .from('blocked_leads')
            .select('email')
            .eq('user_id', user.id);

        if (leadsError) {
            console.error('[Leads API] Error fetching existing leads:', leadsError.message);
        }

        if (blockedError) {
            console.error('[Leads API] Error fetching blocked leads:', blockedError.message);
        }

        const existingEmails = new Set(
            (existingLeads || []).map(l => l.email?.toLowerCase()).filter(Boolean)
        );
        
        const blockedEmails = new Set(
            (blockedLeads || []).map(l => l.email?.toLowerCase()).filter(Boolean)
        );

        return NextResponse.json({
            existingEmails: Array.from(existingEmails),
            blockedEmails: Array.from(blockedEmails),
            totalExisting: existingEmails.size,
            totalBlocked: blockedEmails.size
        });
    } catch (error) {
        console.error('[Leads API] Error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

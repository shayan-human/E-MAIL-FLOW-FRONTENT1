import { NextResponse } from "next/server";
import { auth } from "@insforge/nextjs/server";
import { getInsforgeClient } from "@/lib/insforge-server";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insforge = await getInsforgeClient();
        const { data, error } = await insforge.database
            .from("drafts")
            .select("id, name, subject, body, created_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ data: data || [] });
    } catch (error) {
        console.error("[GET Drafts API Error]:", error);
        return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 });
    }
}

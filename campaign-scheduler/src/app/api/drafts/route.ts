import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-helper";
import { getInsforgeClient, getInsforgeAdminClient } from "@/lib/insforge-server";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insforge = await getInsforgeClient();
        const { data, error } = await insforge
            .from("drafts")
            .select("id, name, subject, body, created_at, folder_id")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

        if (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[GET Drafts API Error]:", message);
            return NextResponse.json({ error: "Failed to fetch drafts", details: message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[GET Drafts API Error]:", message);
        return NextResponse.json({ error: "Failed to fetch drafts", details: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, subject, body: draftBody, folder_id } = body;

        if (!name) {
            return NextResponse.json({ error: "Draft name is required" }, { status: 400 });
        }

        const insforge = await getInsforgeAdminClient();
        const { data, error } = await insforge
            .from("drafts")
            .insert([{
                user_id: user.id,
                name,
                subject: subject || "",
                body: draftBody || "",
                folder_id: folder_id || null,
            }])
            .select("id, name, subject, body, created_at, folder_id")
            .single();

        if (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[POST Drafts API Error]:", message);
            return NextResponse.json({ error: "Failed to create draft", details: message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[POST Drafts API Error]:", message);
        return NextResponse.json({ error: "Failed to create draft", details: message }, { status: 500 });
    }
}

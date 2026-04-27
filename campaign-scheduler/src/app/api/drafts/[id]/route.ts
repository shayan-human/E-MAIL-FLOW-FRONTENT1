import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-helper";
import { getInsforgeClient } from "@/lib/insforge-server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, subject, body: draftBody, folder_id } = body;

        const insforge = await getInsforgeClient();
        
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (subject !== undefined) updateData.subject = subject;
        if (draftBody !== undefined) updateData.body = draftBody;
        if (folder_id !== undefined) updateData.folder_id = folder_id;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await insforge
            .from("drafts")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", user.id)
            .select("id, name, subject, body, created_at, folder_id, updated_at")
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return NextResponse.json({ error: "Draft not found" }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("[PATCH Draft API Error]:", error);
        return NextResponse.json({ error: "Failed to update draft" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const insforge = await getInsforgeClient();
        
        const { error: deleteError } = await insforge
            .from("drafts")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE Draft API Error]:", error);
        return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
    }
}

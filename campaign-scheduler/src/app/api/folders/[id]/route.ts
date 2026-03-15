import { NextResponse } from "next/server";
import { auth } from "@insforge/nextjs/server";
import { getInsforgeClient } from "@/lib/insforge-server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, color } = body;

        const insforge = await getInsforgeClient();
        
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (color !== undefined) updateData.color = color;

        const { data, error } = await insforge.database
            .from("draft_folders")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", user.id)
            .select("id, name, color, created_at")
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return NextResponse.json({ error: "Folder not found" }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("[PATCH Folder API Error]:", error);
        return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
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
        
        const { error: deleteError } = await insforge.database
            .from("draft_folders")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE Folder API Error]:", error);
        return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
    }
}

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
        const { data: folders, error } = await insforge
            .from("draft_folders")
            .select("id, name, color, created_at")
            .eq("user_id", user.id)
            .order("name", { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({ data: folders || [] });
    } catch (error) {
        console.error("[GET Folders API Error]:", error);
        return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, color } = body;

        if (!name) {
            return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
        }

        const insforge = await getInsforgeClient();
        const { data, error } = await insforge
            .from("draft_folders")
            .insert([{
                user_id: user.id,
                name,
                color: color || "#F59E0B",
            }])
            .select("id, name, color, created_at")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error("[POST Folders API Error]:", error);
        return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
    }
}

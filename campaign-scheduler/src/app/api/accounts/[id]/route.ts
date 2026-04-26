import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await auth();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const insforge = await getInsforgeClient();

        const { error } = await insforge
            .from("sender_accounts")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("[DELETE Account API Error]:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { data: { user }, error: authError } = await (insforge.auth as any).getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        const { error } = await insforge.database
            .from("sender_accounts")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) throw error;

        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("[DELETE Account API Error]:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}

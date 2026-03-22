import { auth } from "@insforge/nextjs/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import WarmupClient from "./WarmupClient";
import { redirect } from "next/navigation";

export default async function WarmupPage() {
    const { user } = await auth();

    if (!user) {
        redirect("/");
    }

    const insforge = await getInsforgeClient();

    // Fetch sender accounts (connected Gmail accounts)
    const { data: senderAccounts } = await insforge.database
        .from("sender_accounts")
        .select("id, email, name")
        .eq("user_id", user.id)
        .eq("is_active", true);

    // Fetch warmup accounts
    const { data: warmupAccounts } = await insforge.database
        .from("warmup_accounts")
        .select("*")
        .eq("user_id", user.id);

    // Fetch network opt-in status
    const { data: userSettings } = await insforge.database
        .from("user_settings")
        .select("network_opt_in")
        .eq("user_id", user.id)
        .single();

    const networkOptIn = userSettings?.network_opt_in || false;

    // Format warmup accounts
    const formattedWarmupAccounts = (warmupAccounts || []).map((wa: any) => ({
        id: wa.id,
        gmail_account_id: wa.gmail_account_id,
        gmail_email: "",
        status: wa.status,
        mode: wa.mode,
        day_number: wa.day_number,
        daily_target: wa.daily_target,
    }));

    // Map emails to warmup accounts
    const accountsWithEmails = (senderAccounts || []).map((sa: any) => {
        const wa = formattedWarmupAccounts.find(
            (w: any) => w.gmail_account_id === sa.id
        );
        return {
            id: wa?.id || "",
            gmail_account_id: sa.id,
            gmail_email: sa.email,
            status: wa?.status || "inactive",
            mode: wa?.mode || "own_only",
            day_number: wa?.day_number || 0,
            daily_target: wa?.daily_target || 0,
        };
    });

    return (
        <WarmupClient
            senderAccounts={senderAccounts || []}
            networkOptIn={networkOptIn}
        />
    );
}

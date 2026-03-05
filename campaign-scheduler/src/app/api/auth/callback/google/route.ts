import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { auth } from "@insforge/nextjs/server";

export async function GET(req: Request) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const redirectPath = searchParams.get("state") || "/accounts";

        const origin = new URL(req.url).origin;
        const redirectUri = `${origin}/api/auth/callback/google`;

        console.log(`[OAuth Callback] Code: ${code ? "present" : "missing"}, Redirect Path: ${redirectPath}, URI: ${redirectUri}`);

        if (!code) {
            return NextResponse.redirect(new URL(`${redirectPath}?error=no_code`, req.url));
        }

        // Exchange authorization code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        if (!tokenResponse.ok) {
            const errData = await tokenResponse.text();
            console.error("[Google Token Exchange Error]:", errData);
            return NextResponse.redirect(new URL(`${redirectPath}?error=token_exchange_failed`, req.url));
        }

        const tokens = await tokenResponse.json();
        const accessToken = tokens.access_token;
        const refreshToken = tokens.refresh_token;

        // Get the user's email from Google
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userInfoResponse.ok) {
            return NextResponse.redirect(new URL(`${redirectPath}?error=failed_to_get_email`, req.url));
        }

        const userInfo = await userInfoResponse.json();
        const email = userInfo.email;
        const name = userInfo.name;

        if (!email) {
            return NextResponse.redirect(new URL(`${redirectPath}?error=no_email`, req.url));
        }

        // Upsert sender account (update if exists, insert if new)
        const { error: upsertError } = await insforge.database
            .from("sender_accounts")
            .upsert([{
                user_id: user.id,
                email,
                name: name || null,
                google_access_token: accessToken,
                google_refresh_token: refreshToken || null,
                is_active: true,
            }], { onConflict: "email" });

        if (upsertError) {
            console.error("[Upsert Sender Account Error]:", upsertError);
            return NextResponse.redirect(new URL(`${redirectPath}?error=save_failed`, req.url));
        }

        console.log(`[OAuth Callback] Successfully connected account: ${email}`);
        return NextResponse.redirect(new URL(`${redirectPath}?success=account_connected`, req.url));

    } catch (error) {
        console.error("[Google OAuth Callback Error]:", error);
        return NextResponse.redirect(new URL("/accounts?error=unknown", req.url));
    }
}

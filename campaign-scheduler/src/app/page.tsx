import { redirect } from "next/navigation";

export default function Home() {
    // NUCLEAR OPTION: INSTANT REDIRECT
    // No landing page, no buttons. Just go to the dashboard.
    redirect("/dashboard");
}

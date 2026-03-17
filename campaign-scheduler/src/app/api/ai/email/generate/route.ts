import { NextResponse } from "next/server";
import { Ollama } from "ollama";

const MODEL = "kimi-k2.5:cloud";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OLLAMA_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json(
                { error: "Ollama API key not configured" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { prompt, type } = body;

        if (!prompt || !type) {
            return NextResponse.json(
                { error: "Prompt and type are required" },
                { status: 400 }
            );
        }

        let systemPrompt = "";
        let userMessage = prompt;

        switch (type) {
            case "subject":
                systemPrompt = "You are an expert copywriter. Generate a compelling, personalized email subject line. Keep it short, curiosity-inducing, and relevant. Only output the subject line, nothing else.";
                break;
            case "body":
                systemPrompt = "You are an expert cold email copywriter. Write a concise, personalized email body that feels natural and not spammy. Use the personalization tags provided: {{firstName}}, {{lastName}}, {{fullName}}, {{businessName}}, {{email}}, {{website}}. Keep it under 200 words. Only output the email body, no subject.";
                break;
            case "both":
                systemPrompt = "You are an expert cold email copywriter. Generate both a subject line and email body. The subject should be short and curiosity-inducing. The body should be concise, personalized, and under 200 words. Use personalization tags: {{firstName}}, {{lastName}}, {{fullName}}, {{businessName}}, {{email}}, {{website}}. Format your response as:\n\nSUBJECT: <subject line>\n\nBODY:\n<email body>";
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid type. Use: subject, body, or both" },
                    { status: 400 }
                );
        }

        const ollama = new Ollama({
            host: "https://ollama.com",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        const response = await ollama.chat({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
        });

        const content = response.message?.content || "";

        let subject = "";
        let emailBody = "";

        if (type === "both") {
            const parts = content.split(/SUBJECT:|BODY:/i);
            parts.forEach((part: string) => {
                const trimmed = part.trim();
                if (trimmed && !subject) {
                    subject = trimmed;
                } else if (trimmed) {
                    emailBody = trimmed;
                }
            });
        } else if (type === "subject") {
            subject = content;
        } else {
            emailBody = content;
        }

        return NextResponse.json({
            subject: subject.trim(),
            body: emailBody.trim()
        });

    } catch (error) {
        console.error("[Ollama API Error]:", error);
        return NextResponse.json(
            { error: "Failed to generate email content" },
            { status: 500 }
        );
    }
}

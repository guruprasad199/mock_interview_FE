export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (
            file.type !==
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            return NextResponse.json(
                { error: "Only DOCX supported" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const { value: text } = await mammoth.extractRawText({ buffer });

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Extract skills from resumes." },
                {
                    role: "user",
                    content: `
Extract ONLY skills.
Return a JSON array.

Resume:
${text}
          `,
                },
            ],
        });

        return NextResponse.json({
            skills: completion.choices[0].message.content,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Internal error" },
            { status: 500 }
        );
    }
}

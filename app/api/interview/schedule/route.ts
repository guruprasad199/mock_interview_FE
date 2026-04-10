export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

import { getAdminDb } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

type GroqInterviewPlan = {
    role: string;
    level: string;
    type: string;
    techstack: string[];
    questions: string[];
};

type InterviewPlanParams = {
    userName: string;
    yearsOfExperience: string;
    technology: string;
    level: string;
};

const interviewPlanSchema = z.object({
    role: z.string(),
    level: z.string(),
    type: z.string(),
    techstack: z.array(z.string()).min(1),
    questions: z.array(z.string()).min(5),
});

async function generateGeminiInterviewPlan(params: InterviewPlanParams): Promise<GroqInterviewPlan> {
    const { userName, yearsOfExperience, technology, level } = params;

    const { object } = await generateObject({
        model: google("gemini-2.0-flash-001"),
        schema: interviewPlanSchema,
        prompt: `Create a mock interview plan for ${userName}.
Candidate experience: ${yearsOfExperience}.
Preferred interview technology: ${technology}.
Suggested seniority baseline: ${level}.

Return a JSON object with exactly these fields:
- role: string
- level: string
- type: string
- techstack: string[] (3 to 5 values)
- questions: string[] (exactly 5 concise interview questions)

Rules:
- role must fit the technology
- type should be Technical
- include the requested technology in techstack
- questions must be voice-friendly and have no markdown or numbering.`,
    });

    return {
        role: object.role,
        level: object.level,
        type: object.type,
        techstack: object.techstack,
        questions: object.questions.slice(0, 5),
    };
}

function normalizeYearsOfExperience(rawYears: string) {
    const match = rawYears.match(/\d+(?:\.\d+)?/);

    if (!match) {
        return { years: null, level: "Mid-Level" };
    }

    const years = Number.parseFloat(match[0]);

    if (Number.isNaN(years)) {
        return { years: null, level: "Mid-Level" };
    }

    if (years < 2) {
        return { years, level: "Junior" };
    }

    if (years < 5) {
        return { years, level: "Mid-Level" };
    }

    return { years, level: "Senior" };
}

function parseJsonContent(content: string): GroqInterviewPlan | null {
    try {
        return JSON.parse(content) as GroqInterviewPlan;
    } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            return null;
        }

        try {
            return JSON.parse(jsonMatch[0]) as GroqInterviewPlan;
        } catch {
            return null;
        }
    }
}

function formatProviderError(errorMessage: string, maxLength = 260) {
    const normalized = errorMessage.replace(/\s+/g, " ").trim();

    if (!normalized) {
        return "Unknown provider error";
    }

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength)}...`;
}

export async function POST(request: NextRequest) {
    try {
        const { userId, userName, yearsOfExperience, technology } = await request.json();

        if (!userId || !userName || !yearsOfExperience || !technology) {
            return NextResponse.json(
                { success: false, error: "Missing scheduling details." },
                { status: 400 }
            );
        }

        const groqApiKey = process.env.GROQ_API_KEY;
        const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const openaiApiKey = process.env.OPENAI_API_KEY;

        const { years, level } = normalizeYearsOfExperience(yearsOfExperience);
        const db = getAdminDb();
        const interviewPlanParams = {
            userName,
            yearsOfExperience,
            technology,
            level,
        };

        let interviewPlan: GroqInterviewPlan | null = null;
        let groqErrorMessage = groqApiKey ? "" : "Missing GROQ_API_KEY";
        let geminiErrorMessage = googleApiKey ? "" : "Missing GOOGLE_GENERATIVE_AI_API_KEY";
        let openaiErrorMessage = openaiApiKey ? "" : "Missing OPENAI_API_KEY";

        if (groqApiKey) {
            try {
                const groqResponse = await fetch(GROQ_API_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${groqApiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        temperature: 0.6,
                        response_format: { type: "json_object" },
                        messages: [
                            {
                                role: "system",
                                content:
                                    "You create structured mock interview plans for a voice interview application. Return valid JSON only.",
                            },
                            {
                                role: "user",
                                content: `Create a mock interview plan for ${userName}. Candidate experience: ${yearsOfExperience}. Preferred interview technology: ${technology}. Suggested seniority baseline: ${level}. Return JSON with this exact shape: { \"role\": string, \"level\": string, \"type\": string, \"techstack\": string[], \"questions\": string[] }. Rules: role should fit the technology, type should be Technical, techstack should contain 3 to 5 relevant items including the requested technology, questions must be exactly 5 concise voice-friendly interview questions without markdown or numbering.`,
                            },
                        ],
                    }),
                });

                if (!groqResponse.ok) {
                    const errorText = await groqResponse.text();
                    throw new Error(`Groq request failed: ${errorText}`);
                }

                const groqPayload = await groqResponse.json();
                const content = groqPayload?.choices?.[0]?.message?.content;
                const parsed = typeof content === "string" ? parseJsonContent(content) : null;

                if (!parsed?.role || !parsed?.questions?.length) {
                    throw new Error("Groq returned an invalid interview plan.");
                }

                interviewPlan = parsed;
            } catch (groqError) {
                console.warn("Groq unavailable, using fallback interview plan:", groqError);
                groqErrorMessage = groqError instanceof Error ? groqError.message : "Unknown Groq error";
            }
        }

        if (!interviewPlan && googleApiKey) {
            try {
                interviewPlan = await generateGeminiInterviewPlan(interviewPlanParams);
            } catch (geminiError) {
                console.error("Gemini fallback failed:", geminiError);
                geminiErrorMessage = geminiError instanceof Error ? geminiError.message : "Unknown Gemini error";
            }
        }

        if (!interviewPlan && openaiApiKey) {
            try {
                const openaiResponse = await fetch(OPENAI_API_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${openaiApiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        temperature: 0.6,
                        response_format: { type: "json_object" },
                        messages: [
                            {
                                role: "system",
                                content:
                                    "You create structured mock interview plans for a voice interview application. Return valid JSON only.",
                            },
                            {
                                role: "user",
                                content: `Create a mock interview plan for ${userName}. Candidate experience: ${yearsOfExperience}. Preferred interview technology: ${technology}. Suggested seniority baseline: ${level}. Return JSON with this exact shape: { \"role\": string, \"level\": string, \"type\": string, \"techstack\": string[], \"questions\": string[] }. Rules: role should fit the technology, type should be Technical, techstack should contain 3 to 5 relevant items including the requested technology, questions must be exactly 5 concise voice-friendly interview questions without markdown or numbering.`,
                            },
                        ],
                    }),
                });

                if (!openaiResponse.ok) {
                    const errorText = await openaiResponse.text();
                    throw new Error(`OpenAI request failed: ${errorText}`);
                }

                const openaiPayload = await openaiResponse.json();
                const content = openaiPayload?.choices?.[0]?.message?.content;
                const parsed = typeof content === "string" ? parseJsonContent(content) : null;

                if (!parsed?.role || !parsed?.questions?.length) {
                    throw new Error("OpenAI returned an invalid interview plan.");
                }

                interviewPlan = parsed;
            } catch (openaiError) {
                console.error("OpenAI fallback failed:", openaiError);
                openaiErrorMessage = openaiError instanceof Error ? openaiError.message : "Unknown OpenAI error";
            }
        }

        if (!interviewPlan) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Unable to generate interview questions from AI providers. " +
                        `Groq: ${formatProviderError(groqErrorMessage)}. ` +
                        `Gemini: ${formatProviderError(geminiErrorMessage)}. ` +
                        `OpenAI: ${formatProviderError(openaiErrorMessage)}.`,
                },
                { status: 502 }
            );
        }

        const interview = {
            role: interviewPlan.role,
            type: interviewPlan.type || "Technical",
            level: interviewPlan.level || level,
            techstack: interviewPlan.techstack?.length
                ? interviewPlan.techstack
                : [technology],
            questions: interviewPlan.questions,
            userId,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
            intake: {
                yearsOfExperience: years ?? yearsOfExperience,
                technology,
            },
        };

        const interviewRef = await db.collection("interviews").add(interview);

        return NextResponse.json(
            {
                success: true,
                interviewId: interviewRef.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Interview scheduling failed:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Unable to schedule the interview right now.",
            },
            { status: 500 }
        );
    }
}
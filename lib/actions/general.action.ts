"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { getAdminDb } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

type TranscriptMessage = { role: string; content: string };

const fallbackCategoryNames = [
  "Communication Skills",
  "Technical Knowledge",
  "Problem Solving",
  "Cultural Fit",
  "Confidence and Clarity",
] as const;

function buildFallbackFeedback(transcript: TranscriptMessage[]) {
  const userResponses = transcript
    .filter((item) => item.role === "user")
    .map((item) => item.content.trim())
    .filter(Boolean);

  const totalWords = userResponses.reduce(
    (sum, answer) => sum + answer.split(/\s+/).filter(Boolean).length,
    0
  );
  const avgWords = userResponses.length
    ? Math.round(totalWords / userResponses.length)
    : 0;

  const communicationScore = Math.min(95, Math.max(45, 40 + avgWords * 3));
  const technicalScore = Math.min(
    92,
    Math.max(40, 35 + Math.min(35, totalWords))
  );
  const problemSolvingScore = Math.min(
    90,
    Math.max(42, 42 + Math.floor(userResponses.length * 6))
  );
  const cultureFitScore = Math.min(
    92,
    Math.max(50, 50 + Math.floor(avgWords / 2))
  );
  const confidenceScore = Math.min(93, Math.max(48, 45 + avgWords * 2));

  const categoryScores = [
    {
      name: fallbackCategoryNames[0],
      score: communicationScore,
      comment:
        userResponses.length > 0
          ? "Responses were understandable. Add clearer structure with short opening and closing points."
          : "Very limited response data was captured."
    },
    {
      name: fallbackCategoryNames[1],
      score: technicalScore,
      comment:
        totalWords > 25
          ? "You showed baseline technical context. Include concrete tools, tradeoffs, and measurable outcomes."
          : "Provide more technical depth and examples from real projects."
    },
    {
      name: fallbackCategoryNames[2],
      score: problemSolvingScore,
      comment:
        userResponses.length >= 3
          ? "You attempted to explain your approach. Strengthen by describing constraints and validation steps."
          : "Explain your approach step by step, including debugging and decision-making."
    },
    {
      name: fallbackCategoryNames[3],
      score: cultureFitScore,
      comment:
        "Your responses indicate potential role alignment. Add examples of collaboration, ownership, and communication with teams."
    },
    {
      name: fallbackCategoryNames[4],
      score: confidenceScore,
      comment:
        avgWords >= 12
          ? "You provided reasonably complete answers. Improve confidence with concise and direct phrasing."
          : "Answer with fuller sentences and specific examples to improve clarity and confidence."
    },
  ];

  const totalScore = Math.round(
    categoryScores.reduce((sum, category) => sum + category.score, 0) /
    categoryScores.length
  );

  return {
    totalScore,
    categoryScores,
    strengths: [
      "You completed the interview and provided responses for evaluation.",
      "You demonstrated willingness to explain your experience.",
      "You maintained engagement throughout the session.",
    ],
    areasForImprovement: [
      "Use a STAR style structure for behavioral and project-based answers.",
      "Add specific metrics and impact to each technical example.",
      "Practice concise delivery while keeping technical depth.",
    ],
    finalAssessment:
      "Feedback was generated using a resilient local evaluator because the AI feedback provider was unavailable. Use this report to improve structure, depth, and clarity, then retake the interview for a refreshed score.",
  };
}

/* -------------------------------- CREATE FEEDBACK -------------------------------- */

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;
  const db = getAdminDb();

  if (!interviewId || !userId || !transcript?.length) {
    console.error("createFeedback: Missing required params", params);
    return { success: false };
  }

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    let generatedFeedback:
      | {
        totalScore: number;
        categoryScores: Array<{ name: string; score: number; comment: string }>;
        strengths: string[];
        areasForImprovement: string[];
        finalAssessment: string;
      }
      | null = null;

    try {
      const { object } = await generateObject({
        model: google("gemini-2.0-flash-001", {
          structuredOutputs: false,
        }),
        schema: feedbackSchema,
        prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.
        Be thorough and strict. Clearly point out mistakes and improvement areas.

        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas:
        - Communication Skills
        - Technical Knowledge
        - Problem-Solving
        - Cultural & Role Fit
        - Confidence & Clarity
      `,
        system:
          "You are a professional interviewer analyzing a mock interview.",
      });

      if (!object) {
        throw new Error("AI returned empty feedback object");
      }

      generatedFeedback = {
        totalScore: object.totalScore ?? 0,
        categoryScores: object.categoryScores ?? [],
        strengths: object.strengths ?? [],
        areasForImprovement: object.areasForImprovement ?? [],
        finalAssessment: object.finalAssessment ?? "",
      };
    } catch (aiError) {
      console.error("createFeedback: AI feedback generation failed, using fallback:", aiError);
      generatedFeedback = buildFallbackFeedback(transcript);
    }

    if (!generatedFeedback) {
      generatedFeedback = buildFallbackFeedback(transcript);
    }

    const feedback = {
      interviewId,
      userId,
      totalScore: generatedFeedback.totalScore,
      categoryScores: generatedFeedback.categoryScores,
      strengths: generatedFeedback.strengths,
      areasForImprovement: generatedFeedback.areasForImprovement,
      finalAssessment: generatedFeedback.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

/* -------------------------------- GET INTERVIEW BY ID -------------------------------- */

export async function getInterviewById(
  id?: string
): Promise<Interview | null> {
  if (!id) {
    console.error("getInterviewById: id is undefined");
    return null;
  }

  const db = getAdminDb();

  const interview = await db.collection("interviews").doc(id).get();
  return interview.exists ? (interview.data() as Interview) : null;
}

/* -------------------------------- GET FEEDBACK BY INTERVIEW ID -------------------------------- */

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  const db = getAdminDb();

  if (!interviewId || !userId) {
    console.error("getFeedbackByInterviewId: Missing params", params);
    return null;
  }

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Feedback;
}

/* -------------------------------- GET LATEST INTERVIEWS -------------------------------- */

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const db = getAdminDb();

  if (!userId) {
    console.error("getLatestInterviews: userId is undefined");
    return null;
  }

  // Use only orderBy("createdAt") — the single-field auto-index covers this.
  // Composite indexes (finalized + createdAt, userId != + createdAt) are not
  // guaranteed to exist, so we filter finalized and exclude the current user
  // in JS instead.
  const snapshot = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Interview))
    .filter((i) => i.finalized && i.userId !== userId)
    .slice(0, limit);
}

/* -------------------------------- GET INTERVIEWS BY USER ID -------------------------------- */

export async function getInterviewsByUserId(
  userId?: string
): Promise<Interview[] | null> {
  if (!userId) {
    console.error("getInterviewsByUserId: userId is undefined");
    return null;
  }

  const db = getAdminDb();

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Interview))
    .filter((i) => i.userId === userId);
}

"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

/* -------------------------------- CREATE FEEDBACK -------------------------------- */

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

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
      console.error("createFeedback: AI returned empty object");
      return { success: false };
    }

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore ?? 0,
      categoryScores: object.categoryScores ?? {},
      strengths: object.strengths ?? [],
      areasForImprovement: object.areasForImprovement ?? [],
      finalAssessment: object.finalAssessment ?? "",
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

  const interview = await db.collection("interviews").doc(id).get();
  return interview.exists ? (interview.data() as Interview) : null;
}

/* -------------------------------- GET FEEDBACK BY INTERVIEW ID -------------------------------- */

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

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

  if (!userId) {
    console.error("getLatestInterviews: userId is undefined");
    return null;
  }

  const interviews = await db
    .collection("interviews")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .orderBy("userId") // REQUIRED for != queries
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/* -------------------------------- GET INTERVIEWS BY USER ID -------------------------------- */

export async function getInterviewsByUserId(
  userId?: string
): Promise<Interview[] | null> {
  if (!userId) {
    console.error("getInterviewsByUserId: userId is undefined");
    return null;
  }

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

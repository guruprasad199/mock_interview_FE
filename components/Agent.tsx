"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import TalkingAvatar, { type AvatarViseme, getAvatarVisemeFromText } from "@/components/TalkingAvatar";
import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";
import { trackInterviewStart, trackInterviewComplete } from "@/lib/firebase-analytics";
import {
  deleteInterviewRecording,
  saveInterviewRecording,
} from "@/lib/interview-recording";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    isFinal: boolean;
    0: {
      transcript: string;
    };
    length: number;
  }>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: null | (() => void);
  onerror: null | ((event: SpeechRecognitionErrorEventLike) => void);
  onresult: null | ((event: SpeechRecognitionEventLike) => void);
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

const defaultQuestions = [
  "Tell me about yourself.",
  "What is your strongest technical skill and why?",
  "Describe a challenging project you worked on and how you solved key issues.",
  "How do you approach debugging when a production issue appears?",
  "Why are you a good fit for this role?",
  "How do you prioritize tasks when multiple deadlines are close?",
  "Tell me about a time you handled unclear requirements.",
  "What trade-offs do you consider before choosing a technical approach?",
  "How do you ensure quality before shipping a feature?",
  "What would you improve in your last project if you had one more sprint?",
];

function shuffleList<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  badgeLabel,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasVideoPreview, setHasVideoPreview] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("");
  const [avatarViseme, setAvatarViseme] = useState<AvatarViseme>("rest");

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptRef = useRef<SavedMessage[]>([]);
  const currentQuestionRef = useRef(0);
  const isAwaitingAnswerRef = useRef(false);
  const activeQuestionsRef = useRef<string[]>([]);
  const speechPulseRef = useRef<number | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRequestPendingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStopResolverRef = useRef<null | (() => void)>(null);

  const baseQuestions = useMemo(
    () => (questions && questions.length > 0 ? questions : defaultQuestions.slice(0, 5)),
    [questions]
  );

  const interviewQuestions =
    activeQuestionsRef.current.length > 0
      ? activeQuestionsRef.current
      : baseQuestions;

  const appendMessage = (message: SavedMessage) => {
    transcriptRef.current = [...transcriptRef.current, message];
    setMessages(transcriptRef.current);
    setLastMessage(message.content);
  };

  const cleanupRecordingResources = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }

    setHasVideoPreview(false);
  };

  const stopInterviewRecording = async () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      cleanupRecordingResources();
      setIsRecording(false);
      return;
    }

    if (recorder.state === "inactive") {
      cleanupRecordingResources();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      return;
    }

    await new Promise<void>((resolve) => {
      recordingStopResolverRef.current = resolve;
      recorder.stop();
    });
  };

  const startInterviewRecording = async () => {
    if (
      typeof window === "undefined" ||
      type !== "interview" ||
      !interviewId ||
      !("MediaRecorder" in window) ||
      !navigator.mediaDevices?.getUserMedia ||
      mediaRequestPendingRef.current ||
      mediaRecorderRef.current ||
      mediaStreamRef.current
    ) {
      return;
    }

    mediaRequestPendingRef.current = true;
    setCameraMessage("");

    try {
      await deleteInterviewRecording(interviewId);
    } catch (error) {
      console.error("Failed to clear previous interview clip", error);
    }

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (videoError) {
        console.warn("Camera access unavailable, falling back to audio only.", videoError);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setCameraMessage("Camera access is blocked or unavailable, so only audio is being recorded.");
      }

      cleanupRecordingResources();
      mediaStreamRef.current = stream;
      recordingChunksRef.current = [];

      const hasVideoTrack = stream.getVideoTracks().length > 0;
      setHasVideoPreview(hasVideoTrack);

      if (hasVideoTrack && previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        void previewVideoRef.current.play().catch(() => undefined);
      }

      const preferredMimeType = hasVideoTrack
        ? MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
            ? "video/webm;codecs=vp8,opus"
            : MediaRecorder.isTypeSupported("video/webm")
              ? "video/webm"
              : ""
        : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";

      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const capturedChunks = [...recordingChunksRef.current];
        recordingChunksRef.current = [];

        try {
          if (capturedChunks.length > 0 && interviewId) {
            const mimeType = recorder.mimeType || capturedChunks[0].type || (hasVideoTrack ? "video/webm" : "audio/webm");
            const extension = mimeType.includes("mp4")
              ? "mp4"
              : mimeType.includes("mpeg")
                ? "mp3"
                : "webm";

            await saveInterviewRecording({
              interviewId,
              blob: new Blob(capturedChunks, { type: mimeType }),
              createdAt: Date.now(),
              mimeType,
              fileName: hasVideoTrack
                ? `interview-${interviewId}-video.${extension}`
                : `interview-${interviewId}.${extension}`,
            });
          }
        } catch (error) {
          console.error("Failed to save the interview recording", error);
        } finally {
          cleanupRecordingResources();
          mediaRecorderRef.current = null;
          setIsRecording(false);
          recordingStopResolverRef.current?.();
          recordingStopResolverRef.current = null;
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      mediaRequestPendingRef.current = false;
    } catch (error) {
      console.error("Interview recording could not start", error);
      cleanupRecordingResources();
      setCameraMessage("Camera and microphone permission is needed to show and record your interview video.");
      setIsRecording(false);
      mediaRequestPendingRef.current = false;
    }
  };

  const stopListening = () => {
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // no-op
      }
    }
  };

  const stopAvatarAnimation = () => {
    if (typeof window !== "undefined" && speechPulseRef.current !== null) {
      window.clearInterval(speechPulseRef.current);
      speechPulseRef.current = null;
    }

    setAvatarViseme("rest");
  };

  const clearPendingSpeech = () => {
    if (typeof window !== "undefined" && speechTimeoutRef.current !== null) {
      window.clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };

  const loadPreferredVoice = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();
    preferredVoiceRef.current =
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en") && /zira|aria|samantha|google us english/i.test(voice.name)
      ) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ??
      null;

    return preferredVoiceRef.current;
  };

  const startAvatarAnimation = (text: string) => {
    if (typeof window === "undefined") {
      return;
    }

    stopAvatarAnimation();

    if (!text.trim()) {
      return;
    }

    let cursor = 0;
    setAvatarViseme(getAvatarVisemeFromText(text, 0));

    speechPulseRef.current = window.setInterval(() => {
      cursor = (cursor + 1) % Math.max(text.length, 1);
      setAvatarViseme(getAvatarVisemeFromText(text, cursor));
    }, 90);
  };

  const speak = (text: string, onComplete?: () => void) => {
    if (typeof window === "undefined" || !text.trim()) {
      return;
    }

    setIsSpeaking(false);
    clearPendingSpeech();
    stopAvatarAnimation();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const preferredVoice = preferredVoiceRef.current ?? loadPreferredVoice();

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setIsSpeaking(true);
      startAvatarAnimation(text);
    };
    utterance.onboundary = (event) => {
      if (typeof event.charIndex === "number") {
        setAvatarViseme(getAvatarVisemeFromText(text, event.charIndex));
      }
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      stopAvatarAnimation();
      onComplete?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      stopAvatarAnimation();
    };

    speechTimeoutRef.current = window.setTimeout(() => {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
      speechTimeoutRef.current = null;
    }, 80);
  };

  useEffect(() => {
    const previewNode = previewVideoRef.current;
    const stream = mediaStreamRef.current;

    if (!previewNode || !stream || stream.getVideoTracks().length === 0) {
      return;
    }

    previewNode.srcObject = stream;
    previewNode.muted = true;
    void previewNode.play().catch(() => undefined);
  }, [callStatus, hasVideoPreview, isRecording]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleVoicesChanged = () => {
      loadPreferredVoice();
    };

    loadPreferredVoice();
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      clearPendingSpeech();
    };
  }, []);

  const startListening = () => {
    if (!isSpeechSupported || !recognitionRef.current || callStatus !== CallStatus.ACTIVE) {
      return;
    }

    setErrorMessage("");
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch {
      setErrorMessage("Microphone is busy. You can type your answer below.");
      setIsListening(false);
    }
  };

  const finishInterview = async () => {
    isAwaitingAnswerRef.current = false;
    stopListening();

    if (typeof window !== "undefined") {
      stopAvatarAnimation();
      window.speechSynthesis.cancel();
    }

    await stopInterviewRecording();

    setCompletionMessage(
      type === "interview"
        ? "Interview completed. Generating your feedback now..."
        : "Interview completed. Wrapping up your session..."
    );
    setIsGeneratingFeedback(type === "interview");

    setCallStatus(CallStatus.FINISHED);

    if (interviewId) {
      trackInterviewComplete(type === "generate" ? "resume-screening" : "technical");
    }
  };

  const askQuestion = (questionIndex: number) => {
    const question = interviewQuestions[questionIndex];

    if (!question) {
      finishInterview();
      return;
    }

    currentQuestionRef.current = questionIndex;
    setCurrentQuestionIndex(questionIndex);
    isAwaitingAnswerRef.current = true;
    setManualAnswer("");
    setErrorMessage("");

    appendMessage({ role: "assistant", content: question });

    speak(question, () => {
      if (isSpeechSupported) {
        window.setTimeout(() => startListening(), 250);
      }
    });
  };

  const submitAnswer = (answerText: string) => {
    const normalized = answerText.trim();

    if (!normalized || !isAwaitingAnswerRef.current) {
      return;
    }

    isAwaitingAnswerRef.current = false;
    stopListening();
    setManualAnswer("");

    appendMessage({ role: "user", content: normalized });

    const nextQuestionIndex = currentQuestionRef.current + 1;

    if (nextQuestionIndex < interviewQuestions.length) {
      window.setTimeout(() => askQuestion(nextQuestionIndex), 500);
      return;
    }

    finishInterview();
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const RecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!RecognitionConstructor) {
      setIsSpeechSupported(false);
      return;
    }

    setIsSpeechSupported(true);

    const recognition = new RecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const spokenAnswer = Array.from(event.results)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .join(" ")
        .trim();

      if (!spokenAnswer) {
        return;
      }

      submitAnswer(spokenAnswer);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setErrorMessage("Microphone permission was blocked. You can continue with typed answers.");
      } else {
        setErrorMessage("I could not hear that. You can retry mic or type your answer.");
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      clearPendingSpeech();
      stopAvatarAnimation();
      window.speechSynthesis.cancel();
      void stopInterviewRecording();
    };
  }, []);

  useEffect(() => {
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      if (!interviewId) {
        router.push("/");
        return;
      }

      setCompletionMessage("Interview completed. Generating your feedback now...");
      setIsGeneratingFeedback(true);

      let success = false;

      if (userId && messages.length > 0) {
        const result = await createFeedback({
          interviewId,
          userId,
          transcript: messages,
          feedbackId,
        });

        success = Boolean(result.success);
      }

      setIsGeneratingFeedback(false);

      if (success) {
        setCompletionMessage("Feedback ready. Opening your report...");
      } else {
        setCompletionMessage("Interview completed. Opening feedback page...");
      }

      router.push(`/interview/${interviewId}/feedback`);
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(transcriptRef.current);
      }
    }
  }, [callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = () => {
    transcriptRef.current = [];
    activeQuestionsRef.current = shuffleList(baseQuestions);
    setMessages([]);
    setLastMessage("");
    setManualAnswer("");
    setErrorMessage("");
    setCameraMessage("");
    setCurrentQuestionIndex(0);
    setCompletionMessage("");
    setIsGeneratingFeedback(false);

    try {
      setCallStatus(CallStatus.CONNECTING);

      if (interviewId) {
        trackInterviewStart(type === "generate" ? "resume-screening" : "technical");
      }

      setCallStatus(CallStatus.ACTIVE);
      void startInterviewRecording();

      if (typeof window === "undefined") {
        askQuestion(0);
      } else {
        window.setTimeout(() => askQuestion(0), 60);
      }
    } catch (err) {
      console.error("Interview start failed", err);
      setErrorMessage("Unable to start interview. Please try again.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    finishInterview();
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        {badgeLabel && (
          <p className="rounded-lg bg-dark-200 px-4 py-2 text-sm text-white">
            {badgeLabel}
          </p>
        )}

        {callStatus === CallStatus.ACTIVE && (
          <button
            className="btn-disconnect min-h-10 px-4 py-2"
            onClick={() => handleDisconnect()}
          >
            End Call
          </button>
        )}
      </div>

      <div className="call-view">
        {/* AI Interviewer Card */}
        <TalkingAvatar
          name="AI Interviewer"
          subtitle={
            callStatus === CallStatus.ACTIVE
              ? isSpeaking
                ? "Asking your next interview question"
                : isListening
                  ? "Listening to your answer"
                  : "Waiting for your response"
              : callStatus === CallStatus.FINISHED
                ? "Interview completed"
                : "Ready to begin"
          }
          helperText={
            callStatus === CallStatus.ACTIVE
              ? isListening
                ? "Speak clearly or type your answer below."
                : "The interviewer will ask each question aloud and wait for your response."
              : "Click Start interview to begin the mock session."
          }
          textPreview={lastMessage || interviewQuestions[currentQuestionIndex] || "Let's begin your interview."}
          isSpeaking={isSpeaking}
          isListening={isListening}
          viseme={avatarViseme}
          size="lg"
          className="w-full flex-1 sm:basis-1/2"
        />

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            {hasVideoPreview ? (
              <div className="relative size-45 overflow-hidden rounded-3xl border border-emerald-400/30 bg-black">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full scale-x-[-1] object-cover"
                />
                <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  {isRecording ? "REC" : "Camera on"}
                </div>
              </div>
            ) : (
              <Image
                src="/user-avatar.png"
                alt="profile-image"
                width={539}
                height={539}
                className="rounded-full object-cover size-30"
              />
            )}
            <h3>{userName}</h3>
            <p className="text-center text-sm text-light-100/80">
              {hasVideoPreview
                ? "Your camera preview is live on screen."
                : "Allow camera access to show your live interview video here."}
            </p>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {callStatus === CallStatus.ACTIVE && (
        <div className="transcript-border">
          <div className="transcript flex-col gap-3 py-4 px-4 sm:px-5">
            <p className="text-sm text-light-100/80">
              Question {currentQuestionIndex + 1} of {interviewQuestions.length}
            </p>

            {type === "interview" && (
              <p
                className={cn(
                  "text-sm",
                  isRecording ? "text-emerald-300" : "text-light-100/70"
                )}
              >
                {isRecording
                  ? hasVideoPreview
                    ? "Camera and mic recording are on. Your interview video will appear on the feedback page."
                    : "Mic recording is on. Allow camera access as well if you want video capture."
                  : "Allow camera and microphone access when prompted to save the full interview recording."}
              </p>
            )}

            <div className="w-full flex gap-2 max-sm:flex-col">
              <input
                value={manualAnswer}
                onChange={(event) => setManualAnswer(event.target.value)}
                placeholder="Type your answer here"
                className="flex-1 min-h-11 rounded-full border border-white/15 bg-dark-200 px-4 text-white placeholder:text-light-100/60 outline-none"
              />

              <button
                onClick={() => submitAnswer(manualAnswer)}
                className="btn-primary min-h-11"
              >
                Submit Answer
              </button>

              {isSpeechSupported && (
                <button
                  onClick={startListening}
                  className="btn-secondary min-h-11"
                  disabled={isListening}
                >
                  {isListening ? "Listening..." : "Retry Mic"}
                </button>
              )}
            </div>

            {errorMessage && (
              <p className="text-destructive-100 text-sm">{errorMessage}</p>
            )}

            {cameraMessage && (
              <p className="text-amber-200 text-sm">{cameraMessage}</p>
            )}

            {!isSpeechSupported && (
              <p className="text-light-100/80 text-sm">
                Voice recognition is not available in this browser. Continue with typed answers.
              </p>
            )}
          </div>
        </div>
      )}

      {callStatus === CallStatus.FINISHED && completionMessage && (
        <div className="transcript-border">
          <div className="transcript flex-col gap-3 py-4 px-4 sm:px-5">
            <p className="text-white text-base text-center">{completionMessage}</p>
            {isGeneratingFeedback && (
              <p className="text-light-100/80 text-sm text-center">
                Please wait while we analyze your answers.
              </p>
            )}
          </div>
        </div>
      )}

      {callStatus !== "ACTIVE" && (
        <div className="w-full flex justify-center">
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default Agent;

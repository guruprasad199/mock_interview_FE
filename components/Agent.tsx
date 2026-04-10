"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";
import { trackInterviewStart, trackInterviewComplete } from "@/lib/firebase-analytics";

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

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptRef = useRef<SavedMessage[]>([]);
  const currentQuestionRef = useRef(0);
  const isAwaitingAnswerRef = useRef(false);
  const activeQuestionsRef = useRef<string[]>([]);

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

  const speak = (text: string, onComplete?: () => void) => {
    if (typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onComplete?.();
    };

    window.speechSynthesis.speak(utterance);
  };

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

  const finishInterview = () => {
    isAwaitingAnswerRef.current = false;
    stopListening();

    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }

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
      window.speechSynthesis.cancel();
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
    setCurrentQuestionIndex(0);
    setCompletionMessage("");
    setIsGeneratingFeedback(false);

    try {
      setCallStatus(CallStatus.CONNECTING);

      if (interviewId) {
        trackInterviewStart(type === "generate" ? "resume-screening" : "technical");
      }

      setCallStatus(CallStatus.ACTIVE);
      askQuestion(0);
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
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
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

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
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
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;

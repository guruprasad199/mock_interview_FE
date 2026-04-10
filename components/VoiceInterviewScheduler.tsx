"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Keyboard, Loader2, Mic, Radio, RefreshCcw, Sparkles, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VoiceInterviewSchedulerProps = {
    autoStart?: boolean;
    userId: string;
    userName: string;
};

type SchedulerState = "idle" | "asking" | "listening" | "processing" | "error";

type VoiceAnswer = {
    answer: string;
    question: string;
};

type SchedulerMode = "voice" | "text";

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

const SCHEDULER_QUESTIONS = (userName: string) => [
    `Hello ${userName}, what's your total years of experience?`,
    "In which technology do you want to attend the interview?",
];

const EXPERIENCE_OPTIONS = ["0-6 month", "1 year", "2 year", "3 year"];

const VoiceInterviewScheduler = ({ autoStart = false, userId, userName }: VoiceInterviewSchedulerProps) => {
    const router = useRouter();
    const questions = useMemo(() => SCHEDULER_QUESTIONS(userName), [userName]);
    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
    const currentQuestionRef = useRef(0);
    const statusRef = useRef<SchedulerState>("idle");
    const hasCapturedAnswerRef = useRef(false);
    const autoStartedRef = useRef(false);

    const [answers, setAnswers] = useState<VoiceAnswer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSupported, setIsSupported] = useState(false);
    const [schedulerState, setSchedulerState] = useState<SchedulerState>("idle");
    const [schedulerMode, setSchedulerMode] = useState<SchedulerMode>("voice");
    const [selectedExperience, setSelectedExperience] = useState(EXPERIENCE_OPTIONS[0]);
    const [technologyInput, setTechnologyInput] = useState("");

    const updateSchedulerState = (nextState: SchedulerState) => {
        statusRef.current = nextState;
        setSchedulerState(nextState);
    };

    const speak = (text: string, onComplete?: () => void) => {
        if (typeof window === "undefined") {
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.96;
        utterance.pitch = 1;
        utterance.lang = "en-US";
        utterance.onend = () => onComplete?.();

        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        if (!recognitionRef.current) {
            updateSchedulerState("error");
            setErrorMessage("This browser does not support voice recognition.");
            return;
        }

        hasCapturedAnswerRef.current = false;
        setCurrentTranscript("");
        updateSchedulerState("listening");

        try {
            recognitionRef.current.start();
        } catch {
            setErrorMessage("Microphone is already active. Please try again.");
            updateSchedulerState("error");
        }
    };

    const askQuestion = (questionIndex: number) => {
        currentQuestionRef.current = questionIndex;
        setCurrentQuestionIndex(questionIndex);
        updateSchedulerState("asking");
        setErrorMessage("");

        speak(questions[questionIndex], () => {
            window.setTimeout(() => startListening(), 250);
        });
    };

    const scheduleInterview = async ({
        yearsOfExperience,
        technology,
    }: {
        yearsOfExperience: string;
        technology: string;
    }) => {
        updateSchedulerState("processing");
        setErrorMessage("");

        try {
            const response = await fetch("/api/interview/schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    userName,
                    yearsOfExperience,
                    technology,
                }),
            });

            const payload = await response.json();

            if (!response.ok || !payload?.success || !payload?.interviewId) {
                throw new Error(payload?.error || "Unable to create the interview.");
            }

            speak("Perfect. Your interview is ready. Taking you there now.");
            router.push(`/interview/${payload.interviewId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to schedule the interview.";
            setErrorMessage(message);
            updateSchedulerState("error");
        }
    };

    const handleTypedSchedule = async () => {
        const normalizedTechnology = technologyInput.trim();

        if (!normalizedTechnology) {
            setErrorMessage("Enter the technology you want to attend the interview in.");
            updateSchedulerState("error");
            return;
        }

        await scheduleInterview({
            yearsOfExperience: selectedExperience,
            technology: normalizedTechnology,
        });
    };

    const resetAndStart = () => {
        setAnswers([]);
        setCurrentTranscript("");
        setErrorMessage("");
        setCurrentQuestionIndex(0);
        askQuestion(0);
    };

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const RecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!RecognitionConstructor) {
            setIsSupported(false);
            return;
        }

        setIsSupported(true);

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

            hasCapturedAnswerRef.current = true;
            setCurrentTranscript(spokenAnswer);

            const nextAnswers = [...answers];
            nextAnswers[currentQuestionRef.current] = {
                question: questions[currentQuestionRef.current],
                answer: spokenAnswer,
            };

            setAnswers(nextAnswers);

            const nextQuestionIndex = currentQuestionRef.current + 1;

            if (nextQuestionIndex < questions.length) {
                window.setTimeout(() => askQuestion(nextQuestionIndex), 500);
                return;
            }

            scheduleInterview({
                yearsOfExperience: nextAnswers[0]?.answer || "",
                technology: nextAnswers[1]?.answer || "",
            });
        };

        recognition.onerror = (event) => {
            const message =
                event.error === "not-allowed"
                    ? "Microphone access is blocked. Allow microphone access and try again."
                    : "I could not hear a clear answer. Please try again.";

            setErrorMessage(message);
            updateSchedulerState("error");
        };

        recognition.onend = () => {
            if (statusRef.current === "listening" && !hasCapturedAnswerRef.current) {
                setErrorMessage("I did not catch that. Try again and answer after the tone.");
                updateSchedulerState("error");
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
            window.speechSynthesis.cancel();
        };
    }, [answers, questions]);

    useEffect(() => {
        if (!autoStart || !isSupported || autoStartedRef.current) {
            return;
        }

        autoStartedRef.current = true;
        resetAndStart();
    }, [autoStart, isSupported]);

    const stateLabel =
        schedulerState === "asking"
            ? "Asking"
            : schedulerState === "listening"
                ? "Listening"
                : schedulerState === "processing"
                    ? "Scheduling"
                    : schedulerState === "error"
                        ? "Needs retry"
                        : "Ready";

    return (
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(202,197,254,0.22),_transparent_36%),linear-gradient(135deg,_rgba(10,12,20,0.96),_rgba(18,24,43,0.96))] p-6 sm:p-8">
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />

            <div className="relative flex flex-col gap-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary-100">
                            <Sparkles className="size-3.5" />
                            Voice Scheduling
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                                Schedule your interview by voice.
                            </h1>
                            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
                                Choose voice or text input, share your experience and preferred technology, and the app will create a matching mock interview for you.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSchedulerMode("voice");
                                    setErrorMessage("");
                                }}
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                                    schedulerMode === "voice"
                                        ? "border-primary-200 bg-primary-200 text-dark-100"
                                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                )}
                            >
                                <Mic className="size-4" />
                                Voice
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSchedulerMode("text");
                                    setErrorMessage("");
                                }}
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                                    schedulerMode === "text"
                                        ? "border-primary-200 bg-primary-200 text-dark-100"
                                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                )}
                            >
                                <Keyboard className="size-4" />
                                Text
                            </button>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
                        <div className="flex items-center gap-2 font-semibold">
                            <Radio className="size-4" />
                            {stateLabel}
                        </div>
                        <p className="mt-2 text-cyan-50/80">
                            {schedulerMode === "voice"
                                ? questions[currentQuestionIndex]
                                : "Pick your experience from the dropdown and type the technology to schedule instantly."}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                                        {schedulerMode === "voice" ? "Live assistant" : "Typed intake"}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">
                                        {schedulerMode === "voice" ? "Microphone intake" : "Quick scheduler form"}
                                    </h2>
                                </div>

                                <div className={cn(
                                    "flex size-14 items-center justify-center rounded-full border",
                                    schedulerMode === "voice" && schedulerState === "listening"
                                        ? "border-cyan-300 bg-cyan-300/15 text-cyan-200 shadow-[0_0_32px_rgba(34,211,238,0.28)]"
                                        : "border-white/10 bg-white/5 text-primary-100"
                                )}>
                                    {schedulerState === "processing" ? (
                                        <Loader2 className="size-6 animate-spin" />
                                    ) : schedulerMode === "voice" && schedulerState === "asking" ? (
                                        <Volume2 className="size-6" />
                                    ) : schedulerMode === "text" ? (
                                        <Keyboard className="size-6" />
                                    ) : (
                                        <Mic className="size-6" />
                                    )}
                                </div>
                            </div>

                            {schedulerMode === "voice" ? (
                                <>
                                    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
                                        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Current prompt</p>
                                        <p className="mt-3 text-2xl leading-relaxed text-white">
                                            {questions[currentQuestionIndex]}
                                        </p>

                                        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3">
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Heard from microphone</p>
                                            <p className="mt-2 min-h-6 text-base text-slate-200">
                                                {currentTranscript || "Waiting for your spoken answer."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={resetAndStart}
                                            className="btn-primary min-w-44"
                                            disabled={!isSupported || schedulerState === "processing"}
                                        >
                                            <Mic className="size-4" />
                                            {answers.length > 0 ? "Restart voice intake" : "Start voice intake"}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => askQuestion(currentQuestionIndex)}
                                            disabled={!isSupported || schedulerState === "processing"}
                                            className="min-w-44 rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                                        >
                                            <RefreshCcw className="size-4" />
                                            Repeat question
                                        </Button>
                                    </div>

                                    {!isSupported && (
                                        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                                            This browser does not support the Web Speech API. Use Chrome or Edge for voice scheduling.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <label className="text-sm uppercase tracking-[0.22em] text-slate-500">
                                                Experience
                                            </label>
                                            <select
                                                value={selectedExperience}
                                                onChange={(event) => setSelectedExperience(event.target.value)}
                                                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none transition focus:border-primary-200"
                                            >
                                                {EXPERIENCE_OPTIONS.map((option) => (
                                                    <option key={option} value={option} className="bg-slate-950 text-white">
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm uppercase tracking-[0.22em] text-slate-500">
                                                Technology
                                            </label>
                                            <input
                                                value={technologyInput}
                                                onChange={(event) => setTechnologyInput(event.target.value)}
                                                placeholder="React, Java, Python"
                                                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-primary-200"
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                onClick={handleTypedSchedule}
                                                className="btn-primary min-w-44"
                                                disabled={schedulerState === "processing"}
                                            >
                                                <Keyboard className="size-4" />
                                                Schedule interview
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {errorMessage && (
                                <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                    {errorMessage}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                            {schedulerMode === "voice" ? "Captured answers" : "Scheduling summary"}
                        </p>
                        {schedulerMode === "voice" ? (
                            <div className="mt-6 space-y-4">
                                {questions.map((question, index) => {
                                    const answer = answers[index];

                                    return (
                                        <div key={question} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                                                    answer
                                                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                                                        : "border-white/10 bg-white/5 text-slate-400"
                                                )}>
                                                    {answer ? <CheckCircle2 className="size-4" /> : index + 1}
                                                </div>

                                                <div>
                                                    <p className="text-sm text-slate-400">{question}</p>
                                                    <p className="mt-2 text-base text-white">
                                                        {answer?.answer || "Awaiting spoken answer"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                                    <p className="text-sm text-slate-400">Selected experience</p>
                                    <p className="mt-2 text-base text-white">{selectedExperience}</p>
                                </div>
                                <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                                    <p className="text-sm text-slate-400">Technology</p>
                                    <p className="mt-2 text-base text-white">
                                        {technologyInput.trim() || "Type the technology you want to interview in"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 rounded-3xl border border-white/8 bg-cyan-400/10 p-4 text-sm text-cyan-50">
                            {schedulerMode === "voice"
                                ? "Once both answers are captured, the scheduler uses Groq to generate a tailored technical interview and then opens it automatically."
                                : "The typed scheduler uses your dropdown selection and technology input to generate the interview instantly."}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VoiceInterviewScheduler;
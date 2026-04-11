"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Keyboard, Mic, Radio, RefreshCcw, Sparkles } from "lucide-react";

import TalkingAvatar, { type AvatarViseme, getAvatarVisemeFromText } from "@/components/TalkingAvatar";
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
    `Hi ${userName}, how many years of experience do you have?`,
    "Which technology would you like to be interviewed on?",
];

const EXPERIENCE_OPTIONS = ["0-6 months", "1 year", "2 years", "3+ years"];

const VoiceInterviewScheduler = ({ autoStart = false, userId, userName }: VoiceInterviewSchedulerProps) => {
    const router = useRouter();
    const questions = useMemo(() => SCHEDULER_QUESTIONS(userName), [userName]);
    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
    const currentQuestionRef = useRef(0);
    const statusRef = useRef<SchedulerState>("idle");
    const hasCapturedAnswerRef = useRef(false);
    const autoStartedRef = useRef(false);
    const speechPulseRef = useRef<number | null>(null);
    const speechTimeoutRef = useRef<number | null>(null);
    const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

    const [answers, setAnswers] = useState<VoiceAnswer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSupported, setIsSupported] = useState(false);
    const [schedulerState, setSchedulerState] = useState<SchedulerState>("idle");
    const [schedulerMode, setSchedulerMode] = useState<SchedulerMode>("text");
    const [selectedExperience, setSelectedExperience] = useState("");
    const [technologyInput, setTechnologyInput] = useState("");
    const [assistantPrompt, setAssistantPrompt] = useState(questions[0] ?? "");
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [avatarViseme, setAvatarViseme] = useState<AvatarViseme>("rest");

    const updateSchedulerState = (nextState: SchedulerState) => {
        statusRef.current = nextState;
        setSchedulerState(nextState);
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
            voices.find((voice) =>
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

        setAssistantPrompt(text);
        setIsAvatarSpeaking(false);
        clearPendingSpeech();
        stopAvatarAnimation();
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const preferredVoice = preferredVoiceRef.current ?? loadPreferredVoice();

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 0.96;
        utterance.pitch = 1;
        utterance.lang = "en-US";
        utterance.onstart = () => {
            setIsAvatarSpeaking(true);
            startAvatarAnimation(text);
        };
        utterance.onboundary = (event) => {
            if (typeof event.charIndex === "number") {
                setAvatarViseme(getAvatarVisemeFromText(text, event.charIndex));
            }
        };
        utterance.onend = () => {
            setIsAvatarSpeaking(false);
            stopAvatarAnimation();
            onComplete?.();
        };
        utterance.onerror = () => {
            setIsAvatarSpeaking(false);
            stopAvatarAnimation();
        };

        speechTimeoutRef.current = window.setTimeout(() => {
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
            speechTimeoutRef.current = null;
        }, 80);
    };

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
        if (!recognitionRef.current) {
            updateSchedulerState("error");
            setErrorMessage("This browser does not support voice recognition.");
            return;
        }

        hasCapturedAnswerRef.current = false;
        setCurrentTranscript("Listening... please speak now.");
        setErrorMessage("");
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

            speak("Perfect. Your interview is ready. Taking you there now.", () => {
                router.push(`/interview/${payload.interviewId}`);
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to schedule the interview.";
            setErrorMessage(message);
            updateSchedulerState("error");
        }
    };

    const handleTypedSchedule = async () => {
        const normalizedTechnology = technologyInput.trim();

        if (!selectedExperience) {
            setErrorMessage("Please select your years of experience.");
            updateSchedulerState("error");
            return;
        }

        if (!normalizedTechnology) {
            setErrorMessage("Please enter the technology for your interview.");
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

        if (typeof window === "undefined") {
            askQuestion(0);
            return;
        }

        window.setTimeout(() => askQuestion(0), 60);
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
            setErrorMessage("");
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
            clearPendingSpeech();
            stopAvatarAnimation();
            window.speechSynthesis.cancel();
        };
    }, [answers, questions]);

    useEffect(() => {
        if (!autoStart || !isSupported || autoStartedRef.current) {
            return;
        }

        autoStartedRef.current = true;
        setSchedulerMode("voice");
        resetAndStart();
    }, [autoStart, isSupported]);

    const stateLabel =
        schedulerState === "asking"
            ? "Question asked"
            : schedulerState === "listening"
                ? "Listening"
                : schedulerState === "processing"
                    ? "Creating interview"
                    : schedulerState === "error"
                        ? "Try again"
                        : "Ready";

    const isVoiceFocusActive = schedulerMode === "voice" && ["asking", "listening"].includes(schedulerState);
    const voiceHelperText = schedulerState === "listening"
        ? "Mic is now in the center and listening. Please speak clearly."
        : schedulerState === "asking"
            ? "The question is being read out. The mic will start automatically in the center."
            : "Press Start voice setup to begin.";

    const normalizedTechnology = technologyInput.trim();
    const currentStepNumber = schedulerMode === "voice"
        ? schedulerState === "processing"
            ? 4
            : answers[0]
                ? 3
                : 2
        : schedulerState === "processing"
            ? 4
            : !selectedExperience
                ? 2
                : !normalizedTechnology
                    ? 3
                    : 4;

    const setupSteps = schedulerMode === "voice"
        ? [
            {
                title: "Choose voice mode",
                description: "Keep 'Answer by voice' selected.",
                done: true,
            },
            {
                title: "Answer your experience question",
                description: "Click Start voice setup and answer the first question.",
                done: Boolean(answers[0]),
            },
            {
                title: "Answer your technology question",
                description: "Tell us the technology you want to practice.",
                done: Boolean(answers[1]) || schedulerState === "processing",
            },
            {
                title: "Open your interview",
                description: "We create the interview automatically after both answers.",
                done: schedulerState === "processing",
            },
        ]
        : [
            {
                title: "Choose text mode",
                description: "Text mode is the easiest option if you want to type.",
                done: true,
            },
            {
                title: "Select your experience",
                description: "Pick your years of experience from the dropdown.",
                done: Boolean(selectedExperience),
            },
            {
                title: "Enter your technology",
                description: "Type the skill or technology you want to interview on.",
                done: Boolean(normalizedTechnology),
            },
            {
                title: "Create your interview",
                description: "Click the button below to open your mock interview.",
                done: schedulerState === "processing",
            },
        ];

    return (
        <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(202,197,254,0.22),transparent_36%),linear-gradient(135deg,rgba(10,12,20,0.96),rgba(18,24,43,0.96))] p-4 sm:p-5">
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />

            <div className="relative flex flex-col gap-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-2xl space-y-3">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary-100">
                            <Sparkles className="size-3.5" />
                            Interview Setup
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                                Quick interview setup
                            </h1>
                            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                                Choose a mode, add experience and technology, then start.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
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
                                Answer by voice
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
                                Answer by text
                            </button>
                        </div>

                        <div className="grid gap-2 pt-1 sm:grid-cols-2 xl:grid-cols-4">
                            {setupSteps.map((step, index) => {
                                const stepNumber = index + 1;
                                const isActive = currentStepNumber === stepNumber;

                                return (
                                    <div
                                        key={step.title}
                                        className={cn(
                                            "rounded-2xl border px-3 py-2 text-xs transition-colors",
                                            step.done
                                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-50"
                                                : isActive
                                                    ? "border-primary-200 bg-primary-200/10 text-white"
                                                    : "border-white/10 bg-white/5 text-slate-200"
                                        )}
                                    >
                                        <p className="font-semibold text-white">Step {stepNumber}</p>
                                        <p className="mt-1">{step.title}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)] xl:min-w-55">
                        <div className="flex items-center gap-2 font-semibold">
                            <Radio className="size-4" />
                            {stateLabel} · Step {currentStepNumber} of 4
                        </div>
                        <p className="mt-2 text-cyan-50/80">
                            {setupSteps[currentStepNumber - 1]?.description}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur">
                        <div className="flex flex-col gap-4">
                            <div className={cn(
                                "flex items-start justify-between gap-4 transition-all duration-300",
                                isVoiceFocusActive && "flex-col items-center text-center"
                            )}>
                                <div>
                                    <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                                        {schedulerMode === "voice" ? "Voice assistant" : "Text form"}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">
                                        {schedulerMode === "voice" ? "Voice interview setup" : "Simple interview form"}
                                    </h2>
                                </div>

                                <div className={cn("w-full", isVoiceFocusActive ? "max-w-sm" : "max-w-xs")}>
                                    {schedulerMode === "voice" ? (
                                        <TalkingAvatar
                                            name="PrepWise AI"
                                            subtitle={schedulerState === "asking"
                                                ? "Asking your setup question"
                                                : schedulerState === "listening"
                                                    ? "Listening for your answer"
                                                    : "Interview setup guide"}
                                            helperText={voiceHelperText}
                                            textPreview={assistantPrompt}
                                            isSpeaking={isAvatarSpeaking}
                                            isListening={schedulerState === "listening"}
                                            viseme={avatarViseme}
                                            size={isVoiceFocusActive ? "lg" : "md"}
                                        />
                                    ) : (
                                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
                                            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary-100">
                                                <Keyboard className="size-6" />
                                            </div>
                                            <p className="mt-3 text-sm text-slate-300">
                                                Fill the quick form and we will open your mock interview instantly.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {schedulerMode === "voice" ? (
                                <>
                                    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                                        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Question</p>
                                        <p className="mt-2 text-lg leading-7 text-white sm:text-xl">
                                            {questions[currentQuestionIndex]}
                                        </p>

                                        <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/5 px-3 py-2">
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Your answer</p>
                                            <p className="mt-2 min-h-6 text-base text-slate-200">
                                                {currentTranscript || "The mic will move to the center and start listening here."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={resetAndStart}
                                            className="btn-primary min-w-36"
                                            disabled={!isSupported || schedulerState === "processing"}
                                        >
                                            <Mic className="size-4" />
                                            {answers.length > 0 ? "Start over" : "Start voice setup"}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => askQuestion(currentQuestionIndex)}
                                            disabled={!isSupported || schedulerState === "processing"}
                                            className="min-w-36 rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                                        >
                                            <RefreshCcw className="size-4" />
                                            Ask again
                                        </Button>
                                    </div>

                                    {!isSupported && (
                                        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                                            This browser does not support the Web Speech API. Use Chrome or Edge for voice scheduling.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                                    <div className="grid gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-100">
                                                Step 2
                                            </p>
                                            <label className="mt-2 block text-sm uppercase tracking-[0.22em] text-slate-500">
                                                Years of experience
                                            </label>
                                            <p className="mt-1 text-sm text-slate-300">
                                                Select the option that matches your experience.
                                            </p>
                                            <select
                                                value={selectedExperience}
                                                onChange={(event) => setSelectedExperience(event.target.value)}
                                                className="mt-2 min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-primary-200"
                                            >
                                                <option value="" disabled className="bg-slate-950 text-slate-400">
                                                    Select your experience
                                                </option>
                                                {EXPERIENCE_OPTIONS.map((option) => (
                                                    <option key={option} value={option} className="bg-slate-950 text-white">
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-100">
                                                Step 3
                                            </p>
                                            <label className="mt-2 block text-sm uppercase tracking-[0.22em] text-slate-500">
                                                Interview technology
                                            </label>
                                            <p className="mt-1 text-sm text-slate-300">
                                                Type the skill or technology you want to practice.
                                            </p>
                                            <input
                                                value={technologyInput}
                                                onChange={(event) => setTechnologyInput(event.target.value)}
                                                placeholder="Example: React, Java, Python"
                                                className="mt-2 min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-primary-200"
                                            />
                                        </div>

                                        <div className="rounded-2xl border border-dashed border-primary-200/40 bg-primary-200/10 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-100">
                                                Step 4
                                            </p>
                                            <p className="mt-2 text-sm text-slate-200">
                                                When both fields are ready, click the button below to open your interview.
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <Button
                                                    onClick={handleTypedSchedule}
                                                    className="btn-primary min-w-36"
                                                    disabled={schedulerState === "processing"}
                                                >
                                                    <Keyboard className="size-4" />
                                                    Create my interview
                                                </Button>
                                            </div>
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

                    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                            {schedulerMode === "voice" ? "Your answers" : "Interview summary"}
                        </p>
                        {schedulerMode === "voice" ? (
                            <div className="mt-6 space-y-4">
                                {questions.map((question, index) => {
                                    const answer = answers[index];

                                    return (
                                        <div key={question} className="rounded-3xl border border-white/8 bg-black/20 p-3">
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
                                                    <p className="mt-1 text-sm text-white">
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
                                <div className="rounded-3xl border border-white/8 bg-black/20 p-3">
                                    <p className="text-sm text-slate-400">Experience level</p>
                                    <p className="mt-1 text-sm text-white">
                                        {selectedExperience || "Select your experience to continue"}
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/8 bg-black/20 p-3">
                                    <p className="text-sm text-slate-400">Interview technology</p>
                                    <p className="mt-1 text-sm text-white">
                                        {technologyInput.trim() || "Enter the skill or technology you want to practice"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 rounded-3xl border border-white/8 bg-cyan-400/10 p-3 text-xs text-cyan-50">
                            {schedulerMode === "voice"
                                ? "After we get both answers, we create your interview and open it automatically."
                                : "We use your selections to create and open your interview right away."}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VoiceInterviewScheduler;
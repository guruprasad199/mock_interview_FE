import { Mic, Sparkles, Volume2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type AvatarViseme = "rest" | "closed" | "narrow" | "wide" | "round";

type TalkingAvatarProps = {
    name?: string;
    subtitle?: string;
    helperText?: string;
    textPreview?: string;
    isSpeaking?: boolean;
    isListening?: boolean;
    viseme?: AvatarViseme;
    size?: "sm" | "md" | "lg";
    className?: string;
};

const MOUTH_CLASSES: Record<AvatarViseme, string> = {
    rest: "h-1.5 w-10 rounded-full",
    closed: "h-1 w-8 rounded-full",
    narrow: "h-3.5 w-6 rounded-[999px]",
    wide: "h-4 w-11 rounded-[999px]",
    round: "h-6 w-6 rounded-full",
};

export const getAvatarVisemeFromText = (text: string, charIndex = 0): AvatarViseme => {
    const remainingText = text.slice(Math.max(0, charIndex)).toLowerCase();
    const nextLetter = remainingText.match(/[a-z]/)?.[0];

    if (!nextLetter) {
        return "rest";
    }

    if ("bmp".includes(nextLetter)) {
        return "closed";
    }

    if ("oquw".includes(nextLetter)) {
        return "round";
    }

    if ("aeiy".includes(nextLetter)) {
        return "wide";
    }

    return "narrow";
};

const TalkingAvatar = ({
    name = "AI Interviewer",
    subtitle = "Voice assistant",
    helperText,
    textPreview,
    isSpeaking = false,
    isListening = false,
    viseme = "rest",
    size = "lg",
    className,
}: TalkingAvatarProps) => {
    const faceSize =
        size === "sm" ? "size-20" : size === "md" ? "size-24 sm:size-28" : "size-28 sm:size-32";

    const statusLabel = isSpeaking ? "Speaking" : isListening ? "Listening" : "Ready";

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_38%),linear-gradient(145deg,rgba(8,12,24,0.96),rgba(15,23,42,0.98))] p-5 shadow-[0_24px_80px_rgba(34,211,238,0.12)]",
                className
            )}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(192,132,252,0.10),transparent_32%)]" />

            <div className="relative flex flex-col items-center gap-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
                    {isSpeaking ? <Volume2 className="size-3.5" /> : isListening ? <Mic className="size-3.5" /> : <Sparkles className="size-3.5" />}
                    {statusLabel}
                </div>

                <div className={cn("relative flex items-center justify-center rounded-full border border-cyan-200/35 bg-slate-950/90", faceSize)}>
                    <div
                        className={cn(
                            "absolute inset-0 rounded-full blur-2xl transition-opacity duration-300",
                            isSpeaking || isListening ? "bg-cyan-400/20 opacity-100" : "bg-violet-400/10 opacity-70"
                        )}
                    />

                    <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_35%),linear-gradient(180deg,rgba(186,230,253,0.24),rgba(14,116,144,0.12))]" />

                    <div className="absolute left-1/2 top-[35%] flex -translate-x-1/2 items-center gap-7 sm:gap-8">
                        <span className={cn("h-2.5 w-2.5 rounded-full bg-slate-950 transition-all duration-150", isListening && "animate-pulse")} />
                        <span className={cn("h-2.5 w-2.5 rounded-full bg-slate-950 transition-all duration-150", isListening && "animate-pulse")} />
                    </div>

                    <div className="absolute left-1/2 top-[54%] h-2 w-16 -translate-x-1/2 rounded-full bg-sky-100/20 blur-md" />

                    <div className="absolute left-1/2 top-[60%] flex -translate-x-1/2 items-center justify-center">
                        <div
                            className={cn(
                                "bg-slate-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-100 ease-out",
                                MOUTH_CLASSES[isSpeaking ? viseme : "rest"]
                            )}
                        />
                    </div>

                    <div className="absolute -right-2 top-1/2 flex -translate-y-1/2 gap-1">
                        {["delay-0", "delay-150", "delay-300"].map((delayClass, index) => (
                            <span
                                key={`${delayClass}-${index}`}
                                className={cn(
                                    "w-1 rounded-full bg-cyan-300/80 transition-all",
                                    isSpeaking
                                        ? `h-6 animate-pulse ${delayClass}`
                                        : isListening
                                            ? "h-4"
                                            : "h-2"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">{name}</p>
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-400">{subtitle}</p>
                </div>

                {helperText && <p className="max-w-md text-sm leading-6 text-slate-200">{helperText}</p>}

                {textPreview && (
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Current prompt</p>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white">{textPreview}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TalkingAvatar;

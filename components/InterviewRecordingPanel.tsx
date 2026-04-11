"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Mic, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    getInterviewRecording,
    type StoredInterviewRecording,
} from "@/lib/interview-recording";

const InterviewRecordingPanel = ({ interviewId }: { interviewId: string }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [recordingUrl, setRecordingUrl] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [recording, setRecording] = useState<StoredInterviewRecording | null>(null);

    const isVideoRecording = useMemo(() => recording?.mimeType?.startsWith("video") ?? false, [recording]);

    useEffect(() => {
        let isMounted = true;

        const loadRecording = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const savedRecording = await getInterviewRecording(interviewId);

                if (!isMounted) {
                    return;
                }

                setRecording(savedRecording);
            } catch (error) {
                console.error("Failed to load interview recording", error);

                if (isMounted) {
                    setErrorMessage("We could not load the interview clip for this session.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadRecording();

        return () => {
            isMounted = false;
        };
    }, [interviewId]);

    useEffect(() => {
        if (!recording?.blob) {
            setRecordingUrl("");
            return;
        }

        const nextRecordingUrl = URL.createObjectURL(recording.blob);
        setRecordingUrl(nextRecordingUrl);

        return () => {
            URL.revokeObjectURL(nextRecordingUrl);
        };
    }, [recording]);

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-dark-200/40 p-5">
            <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary-200/15 text-primary-100">
                    {isVideoRecording ? <Video className="size-5" /> : <Mic className="size-5" />}
                </div>

                <div className="space-y-1">
                    <p className="text-sm uppercase tracking-[0.2em] text-light-100/70">
                        Interview Recording
                    </p>
                    <h3 className="text-xl font-semibold text-white">
                        Replay or download your interview recording
                    </h3>
                    <p className="text-sm text-light-100/80">
                        Your latest interview video or audio clip is saved in this browser and can be played or downloaded here.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-light-100/80">
                    <Loader2 className="size-4 animate-spin" />
                    Loading your interview clip...
                </div>
            ) : errorMessage ? (
                <p className="rounded-xl border border-destructive-100/30 bg-destructive-100/10 px-4 py-3 text-sm text-destructive-100">
                    {errorMessage}
                </p>
            ) : recordingUrl ? (
                <>
                    {isVideoRecording ? (
                        <video controls src={recordingUrl} className="w-full rounded-xl bg-black" />
                    ) : (
                        <audio controls src={recordingUrl} className="w-full" />
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-light-100/80">
                            Recorded on {new Date(recording?.createdAt ?? Date.now()).toLocaleString()}
                        </p>

                        <Button className="btn-primary">
                            <a
                                href={recordingUrl}
                                download={recording?.fileName || `interview-${interviewId}.webm`}
                                className="flex items-center gap-2"
                            >
                                <Download className="size-4" />
                                Download {isVideoRecording ? "video" : "clip"}
                            </a>
                        </Button>
                    </div>
                </>
            ) : (
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-light-100/80">
                    No interview clip is available yet. Finish a new interview in this browser to create one.
                </p>
            )}
        </div>
    );
};

export default InterviewRecordingPanel;

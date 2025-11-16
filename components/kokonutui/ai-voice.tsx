"use client";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

type VoiceButtonProps = {
    listening: boolean;
    userSpeaking?: boolean;
    disabled?: boolean;
    isProcessing?: boolean;
    statusLabel?: string;
    onToggle?: () => void;
};

export default function AI_Voice({
    listening,
    userSpeaking,
    disabled,
    isProcessing,
    statusLabel,
    onToggle,
}: VoiceButtonProps) {

    return (
        <div className="w-full py-4">
            <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
                <button
                    className={cn(
                        "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
                        listening
                            ? "bg-none"
                            : "bg-none hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                    type="button"
                    aria-pressed={listening}
                    aria-label={statusLabel || "Toggle voice input"}
                    disabled={disabled}
                    onClick={() => onToggle?.()}
                >
                    {listening ? (
                        <div
                            className="w-6 h-6 rounded-sm animate-spin bg-black  dark:bg-white cursor-pointer pointer-events-auto"
                            style={{ animationDuration: "3s" }}
                        />
                    ) : (
                        <Mic className="w-6 h-6 text-black/90 dark:text-white/90" />
                    )}
                </button>

                <div className="h-4 w-64 flex items-center justify-center gap-0.5">
                    {[...Array(48)].map((_, i) => {
                        const heightPercent = 20 + ((i * 23) % 80);
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "w-0.5 rounded-full transition-all duration-300",
                                    listening
                                        ? cn(
                                            "bg-black/50 dark:bg-white/50 animate-pulse",
                                            userSpeaking && "scale-110 !bg-red-500/80"
                                        )
                                        : "bg-black/10 dark:bg-white/10 h-1"
                                )}
                                style={
                                    listening
                                        ? {
                                            height: `${heightPercent}%`,
                                            animationDelay: `${i * 0.05}s`,
                                        }
                                        : undefined
                                }
                            />
                        );
                    })}
                </div>

                <p className="h-4 text-xs text-black/70 dark:text-white/70">
                    {statusLabel
                        ? statusLabel
                        : listening
                            ? isProcessing
                                ? "Processing voice..."
                                : "Listening..."
                            : "Click to speak"}
                </p>
            </div>
        </div>
    );
}

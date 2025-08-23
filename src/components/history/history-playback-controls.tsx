
"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PlayIcon } from "../icons/play-icon";
import { PauseIcon } from "../icons/pause-icon";
import { StopIcon } from "../icons/stop-icon";
import { cn } from "@/lib/utils";

interface HistoryPlaybackControlsProps {
    isPlaying: boolean;
    progress: number;
    playbackSpeed: number;
    onPlayPause: () => void;
    onStop: () => void;
    onSpeedChange: (speed: number) => void;
    onProgressChange: (value: number[]) => void;
}

export default function HistoryPlaybackControls({
    isPlaying,
    progress,
    playbackSpeed,
    onPlayPause,
    onStop,
    onSpeedChange,
    onProgressChange
}: HistoryPlaybackControlsProps) {

    const speedOptions = [1, 2, 3];

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-10">
            <div className="bg-background/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-border">
                <div className="flex items-center gap-4">
                    <Button onClick={onPlayPause} size="icon" className="bg-primary hover:bg-primary/90 rounded-full h-12 w-12">
                        {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                    </Button>

                    <div className="flex-1 flex items-center gap-2">
                       <Slider
                            value={[progress]}
                            onValueChange={onProgressChange}
                            max={100}
                            step={1}
                        />
                    </div>
                    
                    <Button onClick={onStop} size="icon" variant="ghost" className="rounded-full h-10 w-10 text-gray-700 hover:bg-gray-200">
                        <StopIcon className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center border border-gray-300 rounded-full">
                        {speedOptions.map(speed => (
                            <Button
                                key={speed}
                                onClick={() => onSpeedChange(speed)}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "rounded-full h-8 w-8 text-xs",
                                    playbackSpeed === speed ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-gray-700"
                                )}
                            >
                                {speed}x
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

    
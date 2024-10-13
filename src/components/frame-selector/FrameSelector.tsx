import { useCallback, useEffect, useState } from "react";
import { Alert, Stack } from "@mui/material";
import {
  FrameAwareVideoPlayer,
  FrameAwareVideoPlayerRef,
} from "./FrameAwareVideoPlayer.tsx";
import { usePrevious } from "react-use";

export interface FrameSelectorProps {
  videoUrl: string;
  selectedTime: number | null;
}

export function FrameSelector({ videoUrl, selectedTime }: FrameSelectorProps) {
  const [videoPlayer, setVideoPlayer] =
    useState<FrameAwareVideoPlayerRef | null>(null);
  const previousSelectedTime = usePrevious<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onVideoPlayerRefChange = useCallback(
    (ref: FrameAwareVideoPlayerRef) => {
      if (ref && !videoPlayer) {
        setVideoPlayer(ref);
      }
    },
    [videoPlayer],
  );

  const seek = useCallback(
    (time: number) => {
      if (videoPlayer) {
        setError(null);
        videoPlayer.seek(time);
      } else {
        setError("Video player is not available.");
      }
    },
    [videoPlayer],
  );

  useEffect(() => {
    if (selectedTime && selectedTime !== previousSelectedTime) {
      seek(selectedTime);
    }
  }, [previousSelectedTime, seek, selectedTime]);

  return (
    <Stack spacing={2}>
      <FrameAwareVideoPlayer ref={onVideoPlayerRefChange} videoUrl={videoUrl} />
      {error && <Alert severity={"error"}>{error}</Alert>}
    </Stack>
  );
}

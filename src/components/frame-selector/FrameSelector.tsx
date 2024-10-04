import { useCallback, useEffect, useState } from "react";
import { Frame } from "./useVideoFrame.ts";
import { Alert, Button, Stack } from "@mui/material";
import {
  FrameAwareVideoPlayer,
  FrameAwareVideoPlayerRef,
} from "./FrameAwareVideoPlayer.tsx";

export interface FrameSelectorProps {
  videoUrl: string;
  frames: Frame[];
  setFrames: (frames: Frame[]) => void;
  selectedFrame: number | null;
}

export function FrameSelector({
  videoUrl,
  frames,
  setFrames,
  selectedFrame,
}: FrameSelectorProps) {
  const [videoPlayer, setVideoPlayer] =
    useState<FrameAwareVideoPlayerRef | null>(null);
  const [previousSelectedFrame, setPreviousSelectedFrame] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const onVideoPlayerRefChange = useCallback(
    (ref: FrameAwareVideoPlayerRef) => {
      if (ref && !videoPlayer) {
        setVideoPlayer(ref);
      }
    },
    [videoPlayer],
  );

  const getFrame = () => {
    if (videoPlayer) {
      const frameOrError = videoPlayer.getFrame();
      if ("error" in frameOrError) {
        setError(frameOrError.error);
      } else {
        setError(null);
        setFrames([...frames, frameOrError]);
      }
    } else {
      setError("Video player is not available.");
    }
  };

  const seekToFrame = useCallback(
    (time: number) => {
      if (videoPlayer) {
        setError(null);
        videoPlayer.seekToFrame(time);
      } else {
        setError("Video player is not available.");
      }
    },
    [videoPlayer],
  );

  useEffect(() => {
    if (selectedFrame && selectedFrame !== previousSelectedFrame) {
      seekToFrame(selectedFrame);
      setPreviousSelectedFrame(selectedFrame);
    }
  }, [previousSelectedFrame, seekToFrame, selectedFrame]);

  return (
    <Stack spacing={2}>
      <FrameAwareVideoPlayer ref={onVideoPlayerRefChange} videoUrl={videoUrl} />
      {error && <Alert severity={"error"}>{error}</Alert>}
      {videoPlayer && <Button onClick={getFrame}>Grab Frame</Button>}
    </Stack>
  );
}

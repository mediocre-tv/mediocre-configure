import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import {
  FrameAwareVideoPlayer,
  FrameAwareVideoPlayerRef,
} from "./FrameAwareVideoPlayer.tsx";
import { Frame } from "../frame-context/FrameContext.ts";
import { isErrorWithMessage } from "../grpc/GrpcHealth.ts";
import { usePrevious } from "react-use";

export interface FrameSelectorProps {
  videoUrl: string | null;
  addFrame: (frame: Frame) => void;
  selectedFrame: Frame | null;
}

export function FrameSelector({
  videoUrl,
  addFrame,
  selectedFrame,
}: FrameSelectorProps) {
  const [videoPlayer, setVideoPlayer] =
    useState<FrameAwareVideoPlayerRef | null>(null);
  const previousSelectedFrame = usePrevious<Frame | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onVideoPlayerRefChange = useCallback(
    (ref: FrameAwareVideoPlayerRef) => {
      if (ref && !videoPlayer) {
        setVideoPlayer(ref);
      }
    },
    [videoPlayer],
  );

  const getFrame = async () => {
    if (videoPlayer) {
      try {
        const frame = await videoPlayer.getFrame();
        setError(null);
        addFrame(frame);
      } catch (error) {
        if (isErrorWithMessage(error)) {
          setError(error.message);
        } else {
          throw error;
        }
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
      seekToFrame(selectedFrame.time);
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

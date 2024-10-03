import { useCallback, useState } from "react";
import { Frame } from "./useVideoFrame.ts";
import { Alert, Button, Stack, Typography } from "@mui/material";
import {
  FrameAwareVideoPlayer,
  FrameAwareVideoPlayerRef,
} from "./FrameAwareVideoPlayer.tsx";
import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";

export interface FrameSelectorProps {
  videoUrl: string;
}

export function FrameSelector({ videoUrl }: FrameSelectorProps) {
  const [videoPlayer, setVideoPlayer] =
    useState<FrameAwareVideoPlayerRef | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
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
        setFrames((frames) => [...frames, frameOrError]);
      }
    } else {
      setError("Video player is not available.");
    }
  };

  const seekToFrame = (time: number) => {
    if (videoPlayer) {
      setError(null);
      videoPlayer.seekToFrame(time);
    } else {
      setError("Video player is not available.");
    }
  };

  return (
    <LongOrSideBySideLayout
      leftChild={
        <Stack spacing={2}>
          <FrameAwareVideoPlayer
            ref={onVideoPlayerRefChange}
            videoUrl={videoUrl}
          />
          {error && <Alert severity={"error"}>{error}</Alert>}
          {videoPlayer && <Button onClick={getFrame}>Grab Frame</Button>}
        </Stack>
      }
      rightChild={
        <Stack direction={"row"} sx={{ flexWrap: "wrap" }}>
          {frames.map((frame, index) => (
            <Stack
              key={index}
              width={1 / 4}
              padding={2}
              onClick={() => seekToFrame(frame.time)}
            >
              <img src={frame.image} width={"100%"} />
              <Typography>{frame.time}s</Typography>
            </Stack>
          ))}
        </Stack>
      }
    />
  );
}

import { DragEvent, Ref, useCallback, useRef, useState } from "react";
import { Frame } from "./useVideoFrame.ts";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import {
  FrameAwareVideoPlayer,
  FrameAwareVideoPlayerRef,
} from "./FrameAwareVideoPlayer.tsx";
import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";

export function FrameSelector() {
  const frameAwareVideoPlayerRef = useRef<FrameAwareVideoPlayerRef>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getFrame = () => {
    if (frameAwareVideoPlayerRef.current) {
      const frameOrError = frameAwareVideoPlayerRef.current.getFrame();
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
    if (frameAwareVideoPlayerRef.current) {
      setError(null);
      frameAwareVideoPlayerRef.current.seekToFrame(time);
    } else {
      setError("Video player is not available.");
    }
  };

  return (
    <LongOrSideBySideLayout
      leftChild={
        <Stack spacing={2}>
          <DragDropVideoPlayer
            frameAwareVideoPlayerRef={frameAwareVideoPlayerRef}
          />
          {error && <Alert severity={"error"}>{error}</Alert>}
          <Button onClick={getFrame}>Grab Frame</Button>
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

interface DragDropVideoPlayerProps {
  frameAwareVideoPlayerRef: Ref<FrameAwareVideoPlayerRef>;
}

function DragDropVideoPlayer({
  frameAwareVideoPlayerRef,
}: DragDropVideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const colour = dragging ? "primary.main" : "primary.light";

  return (
    <Box
      borderRadius={2}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ aspectRatio: "16/9" }}
      sx={{
        border: videoUrl ? "none" : "dashed",
        borderColor: colour,
      }}
    >
      {videoUrl ? (
        <FrameAwareVideoPlayer
          ref={frameAwareVideoPlayerRef}
          videoUrl={videoUrl}
        />
      ) : (
        <Typography color={colour}>Drag and drop a video file</Typography>
      )}
    </Box>
  );
}

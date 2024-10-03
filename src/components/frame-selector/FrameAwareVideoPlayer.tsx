import { forwardRef, useImperativeHandle } from "react";
import { FrameOrError, useVideoFrame } from "./useVideoFrame.ts";

export interface FrameAwareVideoPlayerRef {
  getFrame: () => FrameOrError;
  seekToFrame: (time: number) => void;
}

export interface FrameAwareVideoPlayerProps {
  videoUrl: string;
}

export const FrameAwareVideoPlayer = forwardRef<
  FrameAwareVideoPlayerRef,
  FrameAwareVideoPlayerProps
>(({ videoUrl }, ref) => {
  const { videoRef, canvasRef, getFrame, seekToFrame } = useVideoFrame();

  useImperativeHandle(ref, () => ({
    getFrame,
    seekToFrame,
  }));

  return (
    <>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        width="100%"
        height="100%"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
});

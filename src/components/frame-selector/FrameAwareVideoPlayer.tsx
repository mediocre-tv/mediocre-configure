import { forwardRef, useImperativeHandle } from "react";
import { useVideoFrame } from "./useVideoFrame.ts";

export interface FrameAwareVideoPlayerRef {
  seek: (time: number) => void;
}

export interface FrameAwareVideoPlayerProps {
  videoUrl: string;
}

export const FrameAwareVideoPlayer = forwardRef<
  FrameAwareVideoPlayerRef,
  FrameAwareVideoPlayerProps
>(({ videoUrl }, ref) => {
  const { videoRef, canvasRef, seek } = useVideoFrame();

  useImperativeHandle(ref, () => ({
    seek,
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

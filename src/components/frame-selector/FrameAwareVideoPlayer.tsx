import { forwardRef, useImperativeHandle } from "react";
import { useVideoFrame } from "./useVideoFrame.ts";
import { Frame } from "../frame-context/FrameContext.ts";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";

export interface FrameAwareVideoPlayerRef {
  getFrame: () => Promise<Frame>;
  seekToFrame: (time: number) => void;
}

export interface FrameAwareVideoPlayerProps {
  videoUrl: string | null;
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
    <SkeletonBox showSkeleton={!videoUrl}>
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          width="100%"
          height="100%"
        />
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </SkeletonBox>
  );
});

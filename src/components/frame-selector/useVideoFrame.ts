import { Ref, useCallback, useRef } from "react";
import { captureFrame } from "../video/GrabFrames";
import { Frame } from "../frame-context/FrameContext";

export interface useVideoFrameReturns {
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
  getFrame: () => Promise<Frame>;
  seekToFrame: (time: number) => void;
}

export const useVideoFrame = (): useVideoFrameReturns => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getFrame = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        return await captureFrame(video, canvas, context);
      }
    }
    throw new Error("Video or canvas element is not available.");
  }, [videoRef, canvasRef]);

  const seekToFrame = useCallback(
    (time: number) => {
      if (videoRef.current) {
        const video = videoRef.current;
        video.currentTime = time;
      }
    },
    [videoRef],
  );

  return {
    videoRef,
    canvasRef,
    getFrame,
    seekToFrame,
  };
};

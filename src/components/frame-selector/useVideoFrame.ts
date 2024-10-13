import { Ref, useCallback, useRef } from "react";

export interface useVideoFrameReturns {
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
  seek: (time: number) => void;
}

export const useVideoFrame = (): useVideoFrameReturns => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const seek = useCallback(
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
    seek,
  };
};

import { Ref, useCallback, useRef } from "react";

export interface VideoActions {
  getTimestamp: () => number;
  seek: (time: number) => void;
}

export interface VideoRefs {
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
}

export type useVideoFrameReturns = VideoActions & VideoRefs;

export const useVideoFrame = (): useVideoFrameReturns => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getTimestamp = useCallback(() => {
    if (!videoRef.current) {
      throw new Error("No video ref");
    }

    return videoRef.current.currentTime;
  }, [videoRef]);

  const seek = useCallback(
    (time: number) => {
      if (!videoRef.current) {
        throw new Error("No video ref");
      }

      const video = videoRef.current;
      video.currentTime = time;
    },
    [videoRef],
  );

  return {
    videoRef,
    canvasRef,
    getTimestamp,
    seek,
  };
};

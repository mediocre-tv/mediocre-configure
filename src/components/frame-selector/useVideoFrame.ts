import { Ref, useCallback, useEffect, useRef } from "react";

export interface VideoActions {
  getTimestamp: () => number;
  seek: (time: number) => void;
}

export interface VideoRefs {
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
}

export type useVideoFrameReturns = VideoActions & VideoRefs;

export const useVideoFrame = (
  onLoadedData?: () => void,
): useVideoFrameReturns => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getTimestamp = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      throw new Error("No video ref");
    }

    return video.currentTime;
  }, [videoRef]);

  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = time;
      }
    },
    [videoRef],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (video && onLoadedData) {
      video.onloadeddata = onLoadedData;
    }
  }, [onLoadedData, videoRef]);

  return {
    videoRef,
    canvasRef,
    getTimestamp,
    seek,
  };
};

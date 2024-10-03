import { Ref, useCallback, useRef } from "react";

export type Frame = { image: string; time: number };
export type FrameOrError = Frame | { error: string };

export interface useVideoFrameReturns {
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
  getFrame: () => FrameOrError;
  seekToFrame: (time: number) => void;
}

export const useVideoFrame = (): useVideoFrameReturns => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return {
          image: canvas.toDataURL("image/png"),
          time: video.currentTime,
        };
      } else {
        return { error: "Unable to get canvas context." };
      }
    } else {
      return { error: "Video or Canvas element is not available." };
    }
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

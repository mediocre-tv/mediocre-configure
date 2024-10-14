import { Ref } from "react";
import { FallbackImageBox } from "../skeleton/FallbackImageBox.tsx";

export interface VideoWithHiddenCanvasProps {
  videoReady: boolean;
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
  videoUrl: string;
  fallbackImage: string | null;
}

export function VideoWithHiddenCanvas({
  videoReady,
  videoRef,
  canvasRef,
  videoUrl,
  fallbackImage,
}: VideoWithHiddenCanvasProps) {
  return (
    <FallbackImageBox
      shouldFallback={!videoReady}
      fallbackImage={fallbackImage}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        width="100%"
        height="100%"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </FallbackImageBox>
  );
}

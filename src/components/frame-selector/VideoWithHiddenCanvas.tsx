import { Ref } from "react";

export interface VideoWithHiddenCanvasProps {
  videoRef: Ref<HTMLVideoElement>;
  canvasRef: Ref<HTMLCanvasElement>;
  videoUrl: string;
}

export function VideoWithHiddenCanvas({
  videoRef,
  canvasRef,
  videoUrl,
}: VideoWithHiddenCanvasProps) {
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
}

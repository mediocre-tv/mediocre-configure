import { useContext } from "react";
import { FrameContext } from "./FrameContext.ts";

export function useFrames(times: number[]) {
  const { frames, setFrames } = useContext(FrameContext);
  return {
    frames: frames.filter((frame) => times.includes(frame.time)),
    setFrames,
  };
}

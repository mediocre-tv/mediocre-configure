import { useContext } from "react";
import { FrameContext } from "./FrameContext.ts";

export function useFrames(times: number[]) {
  const { frames } = useContext(FrameContext);
  return frames.filter((frame) => times.includes(frame.time));
}

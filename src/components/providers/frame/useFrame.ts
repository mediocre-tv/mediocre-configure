import { useContext } from "react";
import { FrameContext } from "./FrameContext.ts";

export function useFrame(time: number | null) {
  const frameContext = useContext(FrameContext);
  if (!frameContext) {
    throw new Error("No frame context");
  }

  const { frames } = frameContext;
  return time ? (frames.get(time) ?? null) : null;
}

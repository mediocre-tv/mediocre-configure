import { useContext } from "react";
import { FrameContext } from "./FrameContext.ts";

export function useFrames() {
  const frameContext = useContext(FrameContext);
  if (!frameContext) {
    throw new Error("No frame context");
  }

  const { frames } = frameContext;
  return {
    frames,
  };
}

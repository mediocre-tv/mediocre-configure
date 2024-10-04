import { useFrames } from "./useFrames.ts";

export function useFrame(time: number) {
  const frames = useFrames([time]);
  return frames.at(0);
}

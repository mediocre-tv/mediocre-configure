import { useFrames } from "./useFrames.ts";

export function useFrame(time?: number) {
  const { frames, setFrames } = useFrames(time ? [time] : []);
  return { frames: frames.at(0), setFrames };
}

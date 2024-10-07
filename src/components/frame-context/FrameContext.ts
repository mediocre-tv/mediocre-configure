import { createContext } from "react";

export type Frame = { time: number; image?: string };

export interface FrameContextProps {
  frames: Frame[];
  setFrames: (frames: Frame[]) => void;
}

export const FrameContext = createContext<FrameContextProps>({
  frames: [],
  setFrames: () => {},
});

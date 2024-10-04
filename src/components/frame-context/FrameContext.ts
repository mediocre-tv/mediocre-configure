import { createContext } from "react";

export type Frame = { time: number; image?: string };

export interface FrameContextProps {
  frames: Frame[];
}

export const FrameContext = createContext<FrameContextProps>({ frames: [] });

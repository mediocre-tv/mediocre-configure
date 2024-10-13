import { createContext } from "react";

export type Frames = Map<number, string>;

export interface FrameContextProps {
  frames: Frames;
}

export const FrameContext = createContext<FrameContextProps | null>(null);

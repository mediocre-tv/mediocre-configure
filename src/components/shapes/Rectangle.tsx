import { Position } from "./Position.ts";
import { Dimensions } from "./Dimensions.ts";

export interface Rectangles {
  [id: string]: Rectangle;
}

export type Rectangle = Position & Dimensions;

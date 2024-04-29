import { Rect } from "react-konva";
import Konva from "konva";
import RectConfig = Konva.RectConfig;
import { Rectangle } from "../shapes/Rectangle.tsx";
import { KonvaNodeEvents } from "react-konva/ReactKonvaCore";
import KonvaEventObject = Konva.KonvaEventObject;
import Vector2d = Konva.Vector2d;
import { Dimensions } from "./Dimensions.ts";

interface StandardRectProps {
  rectangle: Rectangle;
}

export function StandardRect({ rectangle }: StandardRectProps) {
  return <Rect {...getStandardRectProps(rectangle)} />;
}

function getStandardRectProps(rectangle: Rectangle): RectConfig {
  return {
    x: rectangle.x,
    y: rectangle.y,
    width: rectangle.width,
    height: rectangle.height,
    fill: "grey",
    opacity: 0.5,
    stroke: "black",
    _useStrictMode: true,
  };
}

function getSelectableRectProps(onSelect: () => void): KonvaNodeEvents {
  return {
    onMouseDown: onSelect,
    onClick: onSelect,
    onTap: onSelect,
  };
}

interface DraggableRectProps {
  rectangle: Rectangle;
  onSelect: () => void;
  setRectangle: (rectangle: Rectangle) => void;
  setMouseOverRectangle: (mouseOverRectangle: boolean) => void;
  setIsDragging: (isDragging: boolean) => void;
  boundary: Dimensions;
}

export function DraggableRect({
  rectangle,
  onSelect,
  setRectangle,
  setMouseOverRectangle,
  setIsDragging,
  boundary,
}: DraggableRectProps) {
  return (
    <Rect
      {...getStandardRectProps(rectangle)}
      {...getSelectableRectProps(onSelect)}
      {...getDraggableRectProps(
        rectangle,
        (x: number, y: number) => setRectangle({ ...rectangle, x: x, y: y }),
        setIsDragging,
        boundary,
      )}
      onMouseEnter={() => setMouseOverRectangle(true)}
      onMouseLeave={() => setMouseOverRectangle(false)}
    />
  );
}

function getDraggableRectProps(
  rectangle: Rectangle,
  setRectanglePosition: (x: number, y: number) => void,
  setIsDragging: (isDragging: boolean) => void,
  boundary: Dimensions,
): RectConfig & KonvaNodeEvents {
  return {
    draggable: true,
    onMouseDown() {
      setIsDragging(true);
    },
    onMouseUp() {
      setIsDragging(false);
    },
    onDragStart() {
      setIsDragging(true);
    },
    onDragEnd: (e: KonvaEventObject<DragEvent>) => {
      setIsDragging(false);
      const lastPosition = e.target._lastPos;
      if (lastPosition) {
        setRectanglePosition(lastPosition.x, lastPosition.y);
      }
    },
    dragBoundFunc: (vector: Vector2d) => {
      return {
        x: Math.max(Math.min(vector.x, boundary.width - rectangle.width), 0),
        y: Math.max(Math.min(vector.y, boundary.height - rectangle.height), 0),
      };
    },
  };
}

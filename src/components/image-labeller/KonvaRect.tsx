import { Group, Rect } from "react-konva";
import Konva from "konva";
import { Rectangle } from "../shapes/Rectangle.tsx";
import { KonvaNodeEvents } from "react-konva/ReactKonvaCore";
import { Dimensions } from "../shapes/Dimensions.ts";
import { Position } from "../shapes/Position.ts";
import RectConfig = Konva.RectConfig;
import KonvaEventObject = Konva.KonvaEventObject;
import Vector2d = Konva.Vector2d;
import NodeConfig = Konva.NodeConfig;

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

function getSelectableNodeProps(onSelect: () => void): KonvaNodeEvents {
  return {
    onMouseDown: onSelect,
    onClick: onSelect,
    onTap: onSelect,
  };
}

function getDraggableNodeProps(
  rectangle: Rectangle,
  setRectanglePosition: (x: number, y: number) => void,
  setIsDragging: (isDragging: boolean) => void,
  boundary: Dimensions,
): NodeConfig & KonvaNodeEvents {
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

interface TransformableRectProps {
  rectangle: Rectangle;
  setRectangle: (rectangle: Rectangle) => void;
  startRedrawingRectangle: (startPosition: Position) => void;
  onSelect: () => void;
  setCursor: (cursor: string | null) => void;
  boundary: Dimensions;
}

export function TransformableRect({
  rectangle,
  setRectangle,
  startRedrawingRectangle,
  onSelect,
  setCursor,
  boundary,
}: TransformableRectProps) {
  const handleSize = 7;
  const { height, width, x, y } = rectangle;

  const ResizeCorner = ({
    cursor,
    corner,
    oppositePoint,
  }: {
    cursor: string;
    corner: Position;
    oppositePoint: Position;
  }) => (
    <Rect
      x={corner.x - handleSize / 2}
      y={corner.y - handleSize / 2}
      width={handleSize}
      height={handleSize}
      hitStrokeWidth={handleSize}
      onMouseDown={() => startRedrawingRectangle(oppositePoint)}
      onMouseEnter={() => setCursor(cursor)}
    />
  );

  const corners = [
    { direction: "nw", corner: { x: x, y: y } },
    { direction: "ne", corner: { x: x + width, y: y } },
    { direction: "se", corner: { x: x + width, y: y + height } },
    { direction: "sw", corner: { x: x, y: y + height } },
  ];

  return (
    <Group>
      <Rect
        {...getStandardRectProps(rectangle)}
        {...getSelectableNodeProps(onSelect)}
        {...getDraggableNodeProps(
          rectangle,
          (x: number, y: number) => setRectangle({ ...rectangle, x: x, y: y }),
          (isDragging) =>
            isDragging ? setCursor("grabbing") : setCursor("pointer"),
          boundary,
        )}
        onMouseEnter={() => setCursor("pointer")}
      />
      {corners.map(({ direction, corner }, index) => (
        <ResizeCorner
          key={direction}
          cursor={`${direction}-resize`}
          corner={corner}
          oppositePoint={
            corners[(index + corners.length / 2) % corners.length].corner
          }
        />
      ))}
    </Group>
  );
}

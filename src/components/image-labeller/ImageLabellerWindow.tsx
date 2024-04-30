import { Image, Layer, Line, Stage } from "react-konva";
import { useState } from "react";
import { Position } from "../shapes/Position.ts";
import { v4 as uuid } from "uuid";
import { StandardRect, TransformableRect } from "./KonvaRect.tsx";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;
import { Dimensions } from "../shapes/Dimensions.ts";
import { Rectangle, Rectangles } from "../shapes/Rectangle.tsx";

interface ImageLayerCrosshairsProps {
  mousePosition: Position;
  dimensions: Dimensions;
}

function ImageLayerCrosshairs({
  mousePosition: { x, y },
  dimensions: { height, width },
}: ImageLayerCrosshairsProps) {
  return (
    <>
      <Line points={[0, y, width, y]} stroke="black" strokeWidth={1} />
      <Line points={[x, 0, x, height]} stroke="black" strokeWidth={1} />
    </>
  );
}

interface ImageLayerProps {
  image: HTMLImageElement;
  dimensions: Dimensions;
  mousePosition: Position | null;
  hideCrosshairs: boolean;
  onMouseEnter: () => void;
  onMouseDown: () => void;
}

function ImageLayer({
  image,
  dimensions,
  mousePosition,
  hideCrosshairs,
  onMouseEnter,
  onMouseDown,
}: ImageLayerProps) {
  return (
    <Layer onMouseEnter={onMouseEnter} onMouseDown={onMouseDown}>
      <Image
        image={image}
        width={dimensions.width}
        height={dimensions.height}
      />
      {mousePosition && !hideCrosshairs && (
        <ImageLayerCrosshairs
          mousePosition={mousePosition}
          dimensions={dimensions}
        />
      )}
    </Layer>
  );
}

interface RectanglesLayerProps {
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
  startRedrawingRectangle: (startPosition: Position, id: string) => void;
  boundary: Dimensions;
  setCursor: (cursor: string | null) => void;
}

function RectanglesLayer({
  rectangles,
  setRectangles,
  setSelectedRectangleId,
  startRedrawingRectangle,
  boundary,
  setCursor,
}: RectanglesLayerProps) {
  const setRectangle = (id: string, rectangle: Rectangle) =>
    setRectangles({ ...rectangles, [id]: rectangle });

  return (
    <>
      <Layer onMouseLeave={() => setCursor(null)}>
        {Object.entries(rectangles).map(([id, rectangle]) => (
          <TransformableRect
            key={id}
            rectangle={rectangle}
            onSelect={() => setSelectedRectangleId(id)}
            startRedrawingRectangle={(position) =>
              startRedrawingRectangle(position, id)
            }
            setRectangle={(rectangle) => setRectangle(id, rectangle)}
            setCursor={setCursor}
            boundary={boundary}
          />
        ))}
      </Layer>
    </>
  );
}

interface DrawRectangleLayerProps {
  rectangle: Rectangle | null;
}

function DrawRectangleLayer({ rectangle }: DrawRectangleLayerProps) {
  return (
    <Layer>
      {rectangle !== null && <StandardRect rectangle={rectangle} />}
    </Layer>
  );
}

function rectangleIsValid(rectangle: Rectangle | null): rectangle is Rectangle {
  return rectangle !== null && rectangle.width > 10 && rectangle.height > 10;
}

function getRectangle(start: Position, end: Position) {
  const width = end.x - start.x;
  const height = end.y - start.y;
  return {
    x: width > 0 ? start.x : end.x,
    y: height > 0 ? start.y : end.y,
    width: Math.abs(width),
    height: Math.abs(height),
  };
}

interface ImageLabellerWindowProps {
  image: HTMLImageElement;
  dimensions: Dimensions;
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
}

interface RectangleInProgress {
  id: string;
  start: Position;
}

export default function ImageLabellerWindow({
  image,
  dimensions,
  rectangles,
  setRectangles,
  selectedRectangleId,
  setSelectedRectangleId,
}: ImageLabellerWindowProps) {
  const [mousePosition, setMousePosition] = useState<Position | null>(null);
  const [rectanglesCursor, setRectanglesCursor] = useState<string | null>(null);
  const mouseOverRectangles = !!rectanglesCursor;

  const [rectangleInProgress, setRectangleInProgress] =
    useState<RectangleInProgress | null>(null);
  const isDrawing = mousePosition !== null && rectangleInProgress !== null;

  const cursor = mouseOverRectangles && !isDrawing ? rectanglesCursor : "none";

  const rectangle = isDrawing
    ? getRectangle(rectangleInProgress?.start, mousePosition)
    : null;

  const onStageMouseUp = () => {
    if (rectangleInProgress && rectangleIsValid(rectangle)) {
      setRectangles({ ...rectangles, [rectangleInProgress?.id]: rectangle });
    }
    setRectangleInProgress(null);
  };
  const resetMousePosition = () => setMousePosition(null);
  const setMousePositionFromEvent = ({ evt }: KonvaEventObject<MouseEvent>) =>
    setMousePosition({ x: evt.offsetX, y: evt.offsetY });

  return (
    <Stage
      // must have a positive width and height at all times for rendering
      // https://github.com/konvajs/react-konva/issues/420#issuecomment-545509920
      width={dimensions.width}
      height={dimensions.height}
      style={{ cursor: cursor }}
      onMouseOver={setMousePositionFromEvent}
      onMouseMove={setMousePositionFromEvent}
      onMouseLeave={resetMousePosition}
      onMouseUp={onStageMouseUp}
    >
      <ImageLayer
        image={image}
        dimensions={dimensions}
        mousePosition={mousePosition}
        hideCrosshairs={mouseOverRectangles && !isDrawing}
        onMouseEnter={() => setRectanglesCursor(null)}
        onMouseDown={() =>
          mousePosition &&
          setRectangleInProgress({ id: uuid(), start: mousePosition })
        }
      />
      <RectanglesLayer
        rectangles={rectangles}
        setRectangles={setRectangles}
        setSelectedRectangleId={setSelectedRectangleId}
        selectedRectangleId={selectedRectangleId}
        startRedrawingRectangle={(position, id) =>
          setRectangleInProgress({ id: id, start: position })
        }
        boundary={dimensions}
        setCursor={setRectanglesCursor}
      />
      <DrawRectangleLayer rectangle={rectangle} />
    </Stage>
  );
}

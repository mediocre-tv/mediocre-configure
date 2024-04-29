import { Rectangle, Rectangles } from "../shapes/Rectangle.tsx";
import useImage from "use-image";
import styles from "./ImageLabeller.module.css";
import useImageContainer from "./UseImageContainer.ts";
import { Dimensions } from "./Dimensions.ts";
import { Layer, Image, Stage, Line } from "react-konva";
import { useState } from "react";
import { Position } from "../shapes/Position.ts";
import { v4 as uuid } from "uuid";
import { DraggableRect, StandardRect } from "./KonvaRect.tsx";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;

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
  onMouseDown: () => void;
}

function ImageLayer({
  image,
  dimensions,
  mousePosition,
  hideCrosshairs,
  onMouseDown,
}: ImageLayerProps) {
  return (
    <Layer onMouseDown={onMouseDown}>
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
  boundary: Dimensions;
  setRectanglesCursor: (cursor: string | null) => void;
}

function RectanglesLayer({
  rectangles,
  setRectangles,
  selectedRectangleId,
  setSelectedRectangleId,
  boundary,
  setRectanglesCursor,
}: RectanglesLayerProps) {
  const [mouseOverRectangles, setMouseOverRectangles] = useState(false);
  const [mouseOverSelectedRectangle, setMouseOverSelectedRectangle] =
    useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (isDragging) {
    setRectanglesCursor("grabbing");
  } else if (mouseOverSelectedRectangle) {
    setRectanglesCursor("grab");
  } else if (mouseOverRectangles) {
    setRectanglesCursor("pointer");
  } else {
    setRectanglesCursor(null);
  }

  return (
    <Layer
      onMouseEnter={() => setMouseOverRectangles(true)}
      onMouseLeave={() => setMouseOverRectangles(false)}
    >
      {Object.entries(rectangles).map(([id, rectangle]) => (
        <DraggableRect
          key={id}
          rectangle={rectangle}
          onSelect={() => setSelectedRectangleId(id)}
          setRectangle={(rectangle) =>
            setRectangles({ ...rectangles, [id]: rectangle })
          }
          setIsDragging={setIsDragging}
          boundary={boundary}
          setMouseOverRectangle={() => {
            if (id === selectedRectangleId) {
              return setMouseOverSelectedRectangle;
            }
            return () => {};
          }}
        />
      ))}
    </Layer>
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

interface ImageLabellerWindowProps {
  image: HTMLImageElement;
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
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

function ImageLabellerWindow({
  image,
  rectangles,
  setRectangles,
  selectedRectangleId,
  setSelectedRectangleId,
}: ImageLabellerWindowProps) {
  const { ref, dimensions, scale: _ } = useImageContainer(image);

  const [mousePosition, setMousePosition] = useState<Position | null>(null);
  const [rectanglesCursor, setRectanglesCursor] = useState<string | null>(null);
  const mouseOverRectangles = !!rectanglesCursor;

  const [rectangleStartPosition, setRectangleStartPosition] =
    useState<Position | null>(null);
  const isDrawing = mousePosition !== null && rectangleStartPosition !== null;

  const cursor = mouseOverRectangles && !isDrawing ? rectanglesCursor : "none";

  const rectangle = isDrawing
    ? getRectangle(rectangleStartPosition, mousePosition)
    : null;

  const onStageMouseUp = () => {
    if (rectangleIsValid(rectangle)) {
      setRectangles({ ...rectangles, [uuid()]: rectangle });
    }
    setRectangleStartPosition(null);
  };
  const resetMousePosition = () => setMousePosition(null);
  const setMousePositionFromEvent = ({ evt }: KonvaEventObject<MouseEvent>) =>
    setMousePosition({ x: evt.offsetX, y: evt.offsetY });

  return (
    <div className={styles.stageContainer} ref={ref}>
      {dimensions && (
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
            onMouseDown={() => setRectangleStartPosition(mousePosition)}
          />
          <RectanglesLayer
            rectangles={rectangles}
            setRectangles={setRectangles}
            setSelectedRectangleId={setSelectedRectangleId}
            selectedRectangleId={selectedRectangleId}
            boundary={dimensions}
            setRectanglesCursor={setRectanglesCursor}
          />
          <DrawRectangleLayer rectangle={rectangle} />
        </Stage>
      )}
    </div>
  );
}

interface ImageLabellerProps {
  image: string;
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
}

export default function ImageLabeller({
  image,
  rectangles,
  setRectangles,
}: ImageLabellerProps) {
  const [canvasImage, canvasImageStatus] = useImage(image);
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(
    null,
  );

  return (
    <div className={styles.container}>
      {canvasImage ? (
        <ImageLabellerWindow
          image={canvasImage}
          rectangles={rectangles}
          setRectangles={setRectangles}
          selectedRectangleId={selectedRectangleId}
          setSelectedRectangleId={setSelectedRectangleId}
        />
      ) : (
        <div className={styles.imageStatus}>{canvasImageStatus}</div>
      )}
    </div>
  );
}

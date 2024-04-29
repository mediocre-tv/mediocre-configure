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
  addRectangle: (rectangle: Rectangle) => void;
}

function ImageLayer({ image, dimensions, addRectangle }: ImageLayerProps) {
  const [mousePosition, setMousePosition] = useState<Position | null>(null);

  const [rectangleStartPosition, setRectangleStartPosition] =
    useState<Position | null>(null);
  const isDrawing = mousePosition && rectangleStartPosition;

  let rectangle: Rectangle | null;
  if (isDrawing) {
    const width = mousePosition.x - rectangleStartPosition.x;
    const height = mousePosition.y - rectangleStartPosition.y;
    rectangle = {
      x: width > 0 ? rectangleStartPosition.x : mousePosition.x,
      y: height > 0 ? rectangleStartPosition.y : mousePosition.y,
      width: Math.abs(width),
      height: Math.abs(height),
    };
  } else {
    rectangle = null;
  }

  return (
    <Layer
      onMouseDown={() => {
        setRectangleStartPosition(mousePosition);
      }}
      onMouseUp={() => {
        if (rectangle && rectangle.width > 10 && rectangle.height > 10) {
          addRectangle(rectangle);
        }
        setRectangleStartPosition(null);
      }}
      onMouseOver={({ evt }) =>
        setMousePosition({ x: evt.offsetX, y: evt.offsetY })
      }
      onMouseMove={({ evt }) =>
        setMousePosition({ x: evt.offsetX, y: evt.offsetY })
      }
      onMouseLeave={() => setMousePosition(null)}
    >
      <Image
        image={image}
        width={dimensions.width}
        height={dimensions.height}
      />
      {mousePosition && (
        <ImageLayerCrosshairs
          mousePosition={mousePosition}
          dimensions={dimensions}
        />
      )}
      {rectangle !== null && <StandardRect rectangle={rectangle} />}
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

interface ImageLabellerWindowProps {
  image: HTMLImageElement;
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
}

function ImageLabellerWindow({
  image,
  rectangles,
  setRectangles,
  selectedRectangleId,
  setSelectedRectangleId,
}: ImageLabellerWindowProps) {
  const { ref, dimensions, scale: _ } = useImageContainer(image);

  const [rectanglesCursor, setRectanglesCursor] = useState<string | null>(null);

  const cursor = rectanglesCursor ? rectanglesCursor : "none";

  return (
    <div className={styles.stageContainer} ref={ref}>
      {dimensions && (
        <Stage
          // must have a positive width and height at all times for rendering
          // https://github.com/konvajs/react-konva/issues/420#issuecomment-545509920
          width={dimensions.width}
          height={dimensions.height}
          style={{ cursor: cursor }}
        >
          <ImageLayer
            image={image}
            dimensions={dimensions}
            addRectangle={(rectangle) => {
              setRectangles({ ...rectangles, [uuid()]: rectangle });
            }}
          />
          <RectanglesLayer
            rectangles={rectangles}
            setRectangles={setRectangles}
            setSelectedRectangleId={setSelectedRectangleId}
            selectedRectangleId={selectedRectangleId}
            boundary={dimensions}
            setRectanglesCursor={setRectanglesCursor}
          />
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

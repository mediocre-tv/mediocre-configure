import { Rectangles } from "../shapes/Rectangle.tsx";
import useImage from "use-image";
import styles from "./ImageLabeller.module.css";
import useImageContainer from "./UseImageContainer.ts";
import { Dimensions } from "./Dimensions.ts";
import { Layer, Image, Stage, Line } from "react-konva";
import Konva from "konva";
import { useState } from "react";
import { Position } from "../shapes/Position.ts";

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
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  mousePosition: Position | null;
  setMousePosition: (position: Position | null) => void;
}

function ImageLayer({
  image,
  dimensions,
  onMouseDown,
  mousePosition,
  setMousePosition,
}: ImageLayerProps) {
  return (
    <Layer
      onMouseDown={onMouseDown}
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
    </Layer>
  );
}

interface ImageLabellerWindowProps {
  image: HTMLImageElement;
  rectangles: Rectangles;
}

function ImageLabellerWindow({ image, rectangles }: ImageLabellerWindowProps) {
  const { ref, dimensions, scale } = useImageContainer(image);
  const [mousePosition, setMousePosition] = useState<Position | null>(null);
  const mouseOverImage = !!mousePosition;
  const cursor = mouseOverImage ? "none" : "default";
  return (
    <div className={styles.stageContainer} ref={ref}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        style={{ cursor: cursor }}
      >
        <ImageLayer
          image={image}
          dimensions={dimensions}
          onMouseDown={() => {}}
          mousePosition={mousePosition}
          setMousePosition={setMousePosition}
        />
      </Stage>
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

  return (
    <div className={styles.container}>
      {canvasImage ? (
        <ImageLabellerWindow image={canvasImage} rectangles={rectangles} />
      ) : (
        <div className={styles.imageStatus}>{canvasImageStatus}</div>
      )}
    </div>
  );
}

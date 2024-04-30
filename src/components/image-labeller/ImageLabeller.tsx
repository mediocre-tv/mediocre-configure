import { Rectangle, Rectangles } from "../shapes/Rectangle.tsx";
import useImage from "use-image";
import styles from "./ImageLabeller.module.css";
import useImageContainer from "./UseImageContainer.ts";
import { Dimensions } from "../shapes/Dimensions.ts";
import ImageLabellerWindow from "./ImageLabellerWindow.tsx";

function getScaledRectangle(rectangle: Rectangle, scale: number) {
  return {
    x: Math.round(rectangle.x * scale),
    y: Math.round(rectangle.y * scale),
    width: Math.round(rectangle.width * scale),
    height: Math.round(rectangle.height * scale),
  };
}

function getScaledRectangles(rectangles: Rectangles, scale: number) {
  return Object.fromEntries(
    Object.entries(rectangles).map(([id, rectangle]) => [
      id,
      getScaledRectangle(rectangle, scale),
    ]),
  );
}

interface ScaledImageLabellerWindowProps {
  image: HTMLImageElement;
  dimensions: Dimensions;
  scale: number;
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
}

function ScaledImageLabellerWindow({
  image,
  dimensions,
  scale,
  rectangles,
  setRectangles,
  selectedRectangleId,
  setSelectedRectangleId,
}: ScaledImageLabellerWindowProps) {
  const scaledRectangles = getScaledRectangles(rectangles, scale);
  const setScaledRectangles = (scaledRectangles: Rectangles) => {
    const downscaledRectangles = getScaledRectangles(
      scaledRectangles,
      1 / scale,
    );
    setRectangles(downscaledRectangles);
  };

  return (
    <ImageLabellerWindow
      image={image}
      dimensions={dimensions}
      rectangles={scaledRectangles}
      setRectangles={setScaledRectangles}
      selectedRectangleId={selectedRectangleId}
      setSelectedRectangleId={setSelectedRectangleId}
    />
  );
}

interface ScaledImageLabellerWindowContainerProps {
  image: HTMLImageElement;
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
}

function ScaledImageLabellerWindowContainer({
  image,
  rectangles,
  setRectangles,
  selectedRectangleId,
  setSelectedRectangleId,
}: ScaledImageLabellerWindowContainerProps) {
  const { ref, dimensions, scale: scale } = useImageContainer(image);

  return (
    // always render the stage container, otherwise we can't dynamically resize the image
    <div className={styles.stageContainer} ref={ref}>
      {dimensions && scale && (
        <ScaledImageLabellerWindow
          image={image}
          dimensions={dimensions}
          scale={scale}
          rectangles={rectangles}
          setRectangles={setRectangles}
          selectedRectangleId={selectedRectangleId}
          setSelectedRectangleId={setSelectedRectangleId}
        />
      )}
    </div>
  );
}

interface ImageLabellerProps {
  image: string;
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
}

export default function ImageLabeller({
  image,
  rectangles,
  setRectangles,
  selectedRectangleId,
  setSelectedRectangleId,
}: ImageLabellerProps) {
  const [canvasImage, canvasImageStatus] = useImage(image);

  return (
    <div className={styles.container}>
      {canvasImage ? (
        <ScaledImageLabellerWindowContainer
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

import { Rectangles } from "../shapes/Rectangle.tsx";
import useImage from "use-image";
import styles from "./ImageLabeller.module.css";
import useImageContainer from "./UseImageContainer.ts";
import { Dimensions } from "./Dimensions.ts";
import { Layer, Image, Stage } from "react-konva";
import Konva from "konva";

interface ImageLayerProps {
  image: HTMLImageElement;
  dimensions: Dimensions;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

function ImageLayer({
  image,
  dimensions,
  onMouseDown,
  onMouseEnter,
}: ImageLayerProps) {
  return (
    <Layer>
      <Image
        image={image}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
      />
    </Layer>
  );
}

interface ImageLabellerWindowProps {
  image: HTMLImageElement;
  rectangles: Rectangles;
}

function ImageLabellerWindow({ image, rectangles }: ImageLabellerWindowProps) {
  const { ref, dimensions, scale } = useImageContainer(image);
  return (
    <div className={styles.stageContainer} ref={ref}>
      <Stage width={dimensions.width} height={dimensions.height}>
        <ImageLayer
          image={image}
          dimensions={dimensions}
          onMouseDown={() => {}}
          onMouseEnter={() => {}}
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

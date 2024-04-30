import { useMeasure } from "react-use";
import { Dimensions } from "../shapes/Dimensions.ts";
import { UseMeasureRef } from "react-use/lib/useMeasure";

interface useImageContainerReturns {
  ref: UseMeasureRef<HTMLDivElement>;
  dimensions: Dimensions | null;
  scale: number | null;
}

function useImageContainer(image: HTMLImageElement): useImageContainerReturns {
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  if (containerWidth === 0) {
    return {
      ref,
      dimensions: null,
      scale: null,
    };
  }

  const ratio = image.naturalWidth / image.naturalHeight;
  const width = containerWidth;
  const height = containerWidth / ratio;
  const dimensions = { width, height };
  const scale = width / image.naturalWidth;

  return {
    ref,
    dimensions,
    scale,
  };
}

export default useImageContainer;

import { useMeasure } from "react-use";
import { Dimensions } from "../shapes/Dimensions.ts";
import { UseMeasureRef } from "react-use/lib/useMeasure";

interface useImageContainerReturns {
  ref: UseMeasureRef<HTMLDivElement>;
  dimensions: Dimensions | null;
  scale: number | null;
}

function useImageContainer(image: HTMLImageElement): useImageContainerReturns {
  const [ref, { width: containerWidth, height: containerHeight }] =
    useMeasure<HTMLDivElement>();

  if (containerWidth === 0) {
    return {
      ref,
      dimensions: null,
      scale: null,
    };
  }

  let width, height, scale: number;
  if (image.naturalWidth >= image.naturalHeight) {
    const ratio = image.naturalWidth / image.naturalHeight;
    width = containerWidth;
    height = containerWidth / ratio;
    scale = width / image.naturalWidth;
  } else {
    const ratio = image.naturalHeight / image.naturalWidth;
    height = containerHeight;
    width = containerHeight / ratio;
    scale = height / image.naturalHeight;
  }

  const dimensions = { width, height };

  return {
    ref,
    dimensions,
    scale,
  };
}

export default useImageContainer;

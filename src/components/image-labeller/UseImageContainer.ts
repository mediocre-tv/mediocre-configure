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

  const naturalRatio = image.naturalWidth / image.naturalHeight;
  const widthRatio = containerWidth / image.naturalWidth;
  const heightRatio = containerHeight / image.naturalHeight;

  if (widthRatio > heightRatio) {
    width = containerHeight * naturalRatio;
    height = containerHeight;
    scale = height / image.naturalHeight;
  } else {
    width = containerWidth;
    height = containerWidth / naturalRatio;
    scale = width / image.naturalWidth;
  }

  const dimensions = { width, height };

  return {
    ref,
    dimensions,
    scale,
  };
}

export default useImageContainer;

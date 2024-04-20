import { useMeasure } from "react-use";

function useImageContainer(image: HTMLImageElement) {
  const [ref, { width: containerWidth }] = useMeasure<HTMLDivElement>();

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

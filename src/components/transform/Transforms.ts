import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { Rectangle, Rectangles } from "../shapes/Rectangle.tsx";
import { crop, tesseract } from "./Transform.ts";

export interface Transforms {
  id: string;
  transformations: Transform[];
  [key: string]: unknown;
}

export function getRectangle(transforms: Transform[]): Rectangle | null {
  if (!transforms || !transforms.length) {
    return null;
  }

  const transformation = transforms[0]?.transformation;
  if (
    transformation.oneofKind !== "imageToImage" ||
    transformation.imageToImage.transformation.oneofKind !== "crop"
  ) {
    return null;
  }

  const crop = transformation.imageToImage.transformation.crop;
  if (crop.params.oneofKind !== "fixed") {
    return null;
  }

  const { x, y, width, height } = crop.params.fixed;
  return { x: x, y: y, width: width, height: height };
}

export function getRectangles(transforms: Transforms[]): Rectangles {
  return Object.fromEntries(
    transforms
      .map((transform) => ({
        id: transform.id,
        rectangle: getRectangle(transform.transformations),
      }))
      .filter(
        (value): value is { id: string; rectangle: Rectangle } =>
          value.rectangle !== null,
      )
      .map(({ id, rectangle }) => [id, rectangle]),
  );
}

export function setTransforms(
  rectangles: Rectangles,
  transforms: Transforms[],
  setTransforms: (transforms: Transforms[]) => void,
) {
  const updatedTransforms = transforms.map((transform) => {
    const rectangle = rectangles[transform.id];
    if (
      rectangle === undefined ||
      rectangle === getRectangle(transform.transformations)
    ) {
      return transform;
    } else {
      const transformations = transform.transformations;
      transformations[0] = crop(rectangle);
      return {
        ...transform,
        transformations,
      };
    }
  });
  const newTransforms: Transforms[] = Object.entries(rectangles)
    .filter(([id]) => !transforms.find((transforms) => transforms.id === id))
    .map(([id, rectangle]) => {
      return {
        id: id,
        transformations: [crop(rectangle), tesseract()],
      };
    });
  setTransforms([...updatedTransforms, ...newTransforms]);
}

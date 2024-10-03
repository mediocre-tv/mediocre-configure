import { Rectangles } from "../shapes/Rectangle.tsx";
import { Stack } from "@mui/material";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import { Zone } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import {
  getRectangles,
  setTransforms,
  Transforms,
} from "../transform/Transforms.ts";
import { isImageToImageTransform } from "../transform/Transform.ts";

function getZoneTransforms(zone: Zone): Transforms {
  return {
    id: zone.id,
    transformations: zone.transformations.map((transformation) => ({
      transformation: {
        oneofKind: "imageToImage",
        imageToImage: transformation,
      },
    })),
  };
}

function setZoneTransforms(
  transforms: Transforms[],
  setZones: (zones: Zone[]) => void,
) {
  const updatedZones = transforms.map((transform, index) => {
    return Zone.create({
      id: transform.id,
      name: (transform["name"] as string) ?? `Zone ${index + 1}`,
      transformations: transform.transformations
        .filter(isImageToImageTransform)
        .map((transform) => {
          return transform.transformation.imageToImage;
        }),
    });
  });
  setZones(updatedZones);
}

interface ZoneEditorLeftProps {
  image: string;
  zones: Zone[];
  setZones: (zones: Zone[]) => void;
}

export function ZonesEditorLeft({
  image,
  zones,
  setZones,
}: ZoneEditorLeftProps) {
  const transforms = zones.map(getZoneTransforms);
  const rectangles = getRectangles(transforms);
  const setRectangles = (rectangles: Rectangles) => {
    setTransforms(rectangles, transforms, (transforms: Transforms[]) =>
      setZoneTransforms(transforms, setZones),
    );
  };

  return (
    <Stack spacing={5}>
      <ImageLabeller
        image={image}
        rectangles={rectangles}
        setRectangles={setRectangles}
      />
    </Stack>
  );
}

import { Rectangles } from "../shapes/Rectangle.tsx";
import { Stack } from "@mui/material";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import {
  getRectangles,
  setTransforms,
  Transforms,
} from "../transform/Transforms.ts";

function getRegionTransforms(region: Region) {
  return { id: region.id, transformations: region.transformations };
}

function setRegionTransforms(
  transforms: Transforms[],
  setRegions: (regions: Region[]) => void,
) {
  const updatedRegions = transforms.map((transform, index) => {
    return Region.create({
      id: transform.id,
      name: (transform["name"] as string) ?? `Region ${index + 1}`,
      transformations: transform.transformations,
    });
  });
  setRegions(updatedRegions);
}

interface RegionEditorLeftProps {
  image: string;
  regions: Region[];
  setRegions: (regions: Region[]) => void;
}

export function RegionsEditorLeft({
  image,
  regions,
  setRegions,
}: RegionEditorLeftProps) {
  const transforms = regions.map(getRegionTransforms);
  const rectangles = getRectangles(transforms);
  const setRectangles = (rectangles: Rectangles) => {
    setTransforms(rectangles, transforms, (transforms: Transforms[]) =>
      setRegionTransforms(transforms, setRegions),
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

import { Rectangle, Rectangles } from "../shapes/Rectangle.tsx";
import { Stack } from "@mui/material";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import { crop } from "./Transform.ts";

interface RegionEditorLeftProps {
  image: string;
  regions: Region[];
  setRegions: (regions: Region[]) => void;
}

export function RegionEditorLeft({
  image,
  regions,
  setRegions,
}: RegionEditorLeftProps) {
  const rectangles = getRegionRectangles(regions);
  const setRectangles = (rectangles: Rectangles) =>
    setRegionRectangles(rectangles, regions, setRegions);

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

function getRegionRectangle(region: Region): Rectangle | null {
  const transformations = region.transformations;
  if (!transformations || !transformations.length) {
    return null;
  }

  const transformation = transformations[0]?.transformation;
  if (transformation.oneofKind !== "crop") {
    return null;
  }

  const crop = transformation.crop;
  if (crop.params.oneofKind !== "fixed") {
    return null;
  }

  const { x, y, width, height } = crop.params.fixed;
  return { x: x, y: y, width: width, height: height };
}

function getRegionRectangles(regions: Region[]): Rectangles {
  return Object.fromEntries(
    regions
      .map((region) => ({
        id: region.id,
        rectangle: getRegionRectangle(region),
      }))
      .filter(
        (value): value is { id: string; rectangle: Rectangle } =>
          value.rectangle !== null,
      )
      .map(({ id, rectangle }) => [id, rectangle]),
  );
}

function setRegionRectangles(
  rectangles: Rectangles,
  regions: Region[],
  setRegions: (regions: Region[]) => void,
) {
  const updatedRegions = regions.map((region) => {
    const rectangle = rectangles[region.id];
    if (rectangle === undefined || rectangle === getRegionRectangle(region)) {
      return region;
    } else {
      const transformations = region.transformations;
      transformations[0] = crop(rectangle);
      return {
        ...region,
        transformations,
      };
    }
  });
  const newRegions: Region[] = Object.entries(rectangles)
    .filter(([id]) => !regions.find((region) => region.id === id))
    .map(([id, rectangle]) => {
      return Region.create({
        id: id,
        name: `Region ${regions.length + 1}`,
        transformations: [crop(rectangle)],
      });
    });
  setRegions([...updatedRegions, ...newRegions]);
}

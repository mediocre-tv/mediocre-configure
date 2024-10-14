import {
  Alert,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BoxWithHeaderActions } from "../layout/BoxWithHeaderLayout.tsx";
import {
  getRectangles,
  setTransforms,
  Transforms,
} from "../transform/Transforms.ts";
import { Rectangles } from "../shapes/Rectangle.tsx";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { useZone } from "../providers/zone/useZone.ts";
import { useRegion } from "../providers/region/useRegion.ts";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";
import {
  RegionConfiguration,
  RegionConfigurations,
  ZoneConfiguration,
} from "../providers/configuration/ConfigurationContext.ts";
import { RegionProvider } from "../providers/region/RegionProvider.tsx";
import { getPrettyTime } from "../../utilities/timestamp.ts";
import {
  RegionEditorViewToggles,
  RegionsEditorView,
} from "./RegionsEditor.tsx";
import { useRegionResults } from "../providers/region/useRegionResults.ts";
import {
  TransformResultsViewer,
  TransformResultViewer,
} from "../transform/TransformResultViewer.tsx";
import { useZoneResult } from "../providers/zone/useZoneResult.ts";
import { useZoneRegions } from "../providers/region/useZoneRegions.ts";

export interface RegionsEditorSingleFrameProps {
  setRegionView: (view: RegionsEditorView) => void;
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
}

export function RegionsEditorSingleFrame({
  setRegionView,
  timestamps,
  selectedTimestamp,
  setSelectedTimestamp,
}: RegionsEditorSingleFrameProps) {
  return (
    <LongOrSideBySideLayout
      leftChild={
        <RegionsEditorSingleFrameLeft
          timestamps={timestamps}
          selectedTimestamp={selectedTimestamp}
          setSelectedTimestamp={setSelectedTimestamp}
          setRegionView={setRegionView}
        />
      }
      rightChild={
        <RegionsEditorSingleFrameRight timestamp={selectedTimestamp} />
      }
    />
  );
}

export function getRegionTransforms(region: RegionConfiguration): Transforms {
  return {
    id: region.id,
    transformations: region.transforms,
  };
}

function setRegionTransforms(
  zone: ZoneConfiguration,
  regions: RegionConfigurations,
  transforms: Transforms[],
  setRegions: (regions: RegionConfigurations) => void,
  timestamps: number[],
) {
  const updatedRegions: RegionConfigurations = new Map(
    transforms.map((transform, index) => {
      const oldRegion = regions.get(transform.id);
      const newRegion: RegionConfiguration = oldRegion
        ? {
            ...oldRegion,
            transforms: transform.transformations,
          }
        : {
            id: transform.id,
            name: `Region ${index + 1}`,
            zonePaths: zone.stagePaths.map((stagePath) => ({
              stageId: stagePath.stageId,
              zoneId: zone.id,
            })),
            transforms: transform.transformations,
            tests: timestamps.map((time) => ({ time, value: "" })),
          };
      return [transform.id, newRegion];
    }),
  );
  setRegions(updatedRegions);
}

interface RegionFramesViewerProps {
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
}

function RegionsFramesViewer({
  timestamps,
  selectedTimestamp,
  setSelectedTimestamp,
}: RegionFramesViewerProps) {
  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Stack
      direction={"row"}
      padding={2}
      sx={{
        ...(hasLgBreakpoint
          ? {
              flexWrap: "wrap",
            }
          : {
              overflow: "auto",
            }),
      }}
    >
      {timestamps.map((timestamp) => (
        <RegionsFrameViewer
          key={timestamp}
          timestamp={timestamp}
          selected={timestamp === selectedTimestamp}
          onClick={() => setSelectedTimestamp(timestamp)}
        />
      ))}
    </Stack>
  );
}

interface RegionsFrameViewerProps {
  timestamp: number;
  selected: boolean;
  onClick: () => void;
}

function RegionsFrameViewer({
  timestamp,
  selected,
  onClick,
}: RegionsFrameViewerProps) {
  const { result: zoneResult } = useZoneResult(timestamp);

  return (
    <Stack
      key={timestamp}
      spacing={1}
      padding={2}
      borderRadius={2}
      sx={{
        ...(selected && {
          backgroundColor: (theme) => theme.palette.action.selected,
        }),
      }}
    >
      <SkeletonBox showSkeleton={!zoneResult} width={200} aspectRatio={"16/9"}>
        {zoneResult && "image" in zoneResult ? (
          <img
            src={zoneResult.image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
              cursor: "pointer",
            }}
            onClick={onClick}
          />
        ) : (
          zoneResult && <Alert severity={"warning"}>{zoneResult.error}</Alert>
        )}
      </SkeletonBox>
      <Typography textAlign={"center"}>{getPrettyTime(timestamp)}</Typography>
    </Stack>
  );
}

interface RegionEditorLeftProps {
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
  setRegionView: (view: RegionsEditorView) => void;
}

function RegionsEditorSingleFrameLeft({
  timestamps,
  selectedTimestamp,
  setSelectedTimestamp,
  setRegionView,
}: RegionEditorLeftProps) {
  const { zone } = useZone();
  const { regions, setRegions } = useZoneRegions();

  const transforms = Array.from(regions)
    .map(([, region]) => region)
    .map(getRegionTransforms);

  const rectangles = getRectangles(transforms);

  const setRectangles = (rectangles: Rectangles) => {
    setTransforms(rectangles, transforms, (transforms: Transforms[]) =>
      setRegionTransforms(zone, regions, transforms, setRegions, timestamps),
    );
  };

  const { result: zoneResult } = useZoneResult(selectedTimestamp);

  return (
    <Stack spacing={5}>
      <SkeletonBox showSkeleton={!zoneResult}>
        {zoneResult && "image" in zoneResult ? (
          <ImageLabeller
            image={zoneResult.image}
            rectangles={rectangles}
            setRectangles={setRectangles}
          />
        ) : (
          zoneResult && <Alert severity={"warning"}>{zoneResult.error}</Alert>
        )}
      </SkeletonBox>
      <RegionEditorViewToggles
        regionView={"Single Frame"}
        setRegionView={setRegionView}
      />
      <RegionsFramesViewer
        timestamps={timestamps}
        selectedTimestamp={selectedTimestamp}
        setSelectedTimestamp={setSelectedTimestamp}
      />
    </Stack>
  );
}

interface RegionEditorRightProps {
  timestamp: number;
}

function RegionsEditorSingleFrameRight({ timestamp }: RegionEditorRightProps) {
  const { regions } = useZoneRegions();
  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Stack
      height={1}
      spacing={5}
      textAlign={"center"}
      sx={{
        ...(hasLgBreakpoint && {
          overflow: "auto",
        }),
      }}
    >
      {Array.from(regions.keys()).map((id) => (
        <RegionProvider key={id} id={id}>
          <RegionEditor timestamp={timestamp} />
        </RegionProvider>
      ))}
    </Stack>
  );
}

interface RegionEditorBodyProps {
  timestamp: number;
}

function RegionEditorBody({ timestamp }: RegionEditorBodyProps) {
  const { result: zoneResult } = useZoneResult(timestamp);
  const { results: regionResults } = useRegionResults(timestamp);
  const { region, setRegion } = useRegion();

  return (
    <SkeletonBox showSkeleton={!zoneResult}>
      {zoneResult && "image" in zoneResult ? (
        <TransformResultsViewer
          image={zoneResult.image}
          results={regionResults}
          transforms={region.transforms}
          setTransforms={(transforms) => setRegion({ ...region, transforms })}
        />
      ) : (
        zoneResult && (
          <TransformResultViewer label={"Zone Error"} result={zoneResult} />
        )
      )}
    </SkeletonBox>
  );
}

interface RegionEditorProps {
  timestamp: number;
}

function RegionEditor({ timestamp }: RegionEditorProps) {
  const { region, setRegion, deleteRegion } = useRegion();

  return (
    <BoxWithHeaderActions
      name={region.name}
      setName={(name) => setRegion({ ...region, name })}
      actions={[{ onDelete: deleteRegion }]}
      body={<RegionEditorBody timestamp={timestamp} />}
    />
  );
}

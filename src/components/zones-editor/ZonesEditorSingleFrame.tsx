import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import {
  getRectangles,
  setTransforms,
  Transforms,
} from "../transform/Transforms.ts";
import { isImageToImageTransform } from "../transform/Transform.ts";
import { Rectangles } from "../shapes/Rectangle.tsx";
import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import { BoxWithHeaderActions } from "../layout/BoxWithHeaderLayout.tsx";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";
import {
  StageConfiguration,
  ZoneConfiguration,
  ZoneConfigurations,
} from "../providers/configuration/ConfigurationContext.ts";
import { useZones } from "../providers/zone/useZones.ts";
import { useFrame } from "../providers/frame/useFrame.ts";
import { useStage } from "../providers/stage/useStage.ts";
import { ZoneProvider } from "../providers/zone/ZoneProvider.tsx";
import { useZoneResults } from "../providers/zone/useZoneResults.ts";
import { useZone } from "../providers/zone/useZone.ts";
import { TransformResultViewer } from "./TransformResultViewer.tsx";
import { ZoneEditorViewToggles, ZonesEditorView } from "./ZonesEditor.tsx";
import { getPrettyTime } from "../../utilities/timestamp.ts";

export interface ZonesEditorSingleFrameProps {
  setZoneView: (view: ZonesEditorView) => void;
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
}

export function ZonesEditorSingleFrame({
  setZoneView,
  timestamps,
  selectedTimestamp,
  setSelectedTimestamp,
}: ZonesEditorSingleFrameProps) {
  return (
    <LongOrSideBySideLayout
      leftChild={
        <ZonesEditorSingleFrameLeft
          timestamps={timestamps}
          selectedTimestamp={selectedTimestamp}
          setSelectedTimestamp={setSelectedTimestamp}
          setZoneView={setZoneView}
        />
      }
      rightChild={<ZonesEditorSingleFrameRight timestamp={selectedTimestamp} />}
    />
  );
}

export function getZoneTransforms(zone: ZoneConfiguration): Transforms {
  return {
    id: zone.id,
    transformations: zone.transforms.map((transformation) => ({
      transformation: {
        oneofKind: "imageToImage",
        imageToImage: transformation,
      },
    })),
  };
}

function setZoneTransforms(
  stage: StageConfiguration,
  zones: ZoneConfigurations,
  transforms: Transforms[],
  setZones: (zones: ZoneConfigurations) => void,
  timestamps: number[],
) {
  const updatedZones: ZoneConfigurations = new Map(
    transforms.map((transform, index) => {
      const oldZone = zones.get(transform.id);
      const newTransforms = transform.transformations
        .filter(isImageToImageTransform)
        .map((transform) => {
          return transform.transformation.imageToImage;
        });
      const newZone: ZoneConfiguration = oldZone
        ? {
            ...oldZone,
            transforms: newTransforms,
          }
        : {
            id: transform.id,
            name: `Zone ${index + 1}`,
            stagePaths: [{ stageId: stage.id }],
            regionIds: [],
            transforms: newTransforms,
            tests: timestamps.map((time) => ({ time, visible: true })),
          };
      return [transform.id, newZone];
    }),
  );
  setZones(updatedZones);
}

interface ZoneFramesViewerProps {
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
}

function ZonesFramesViewer({
  timestamps,
  selectedTimestamp,
  setSelectedTimestamp,
}: ZoneFramesViewerProps) {
  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Stack
      direction={"row"}
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
        <ZonesFrameViewer
          key={timestamp}
          timestamp={timestamp}
          selected={timestamp === selectedTimestamp}
          onClick={() => setSelectedTimestamp(timestamp)}
        />
      ))}
    </Stack>
  );
}

interface ZonesFrameViewerProps {
  timestamp: number;
  selected: boolean;
  onClick: () => void;
}

function ZonesFrameViewer({
  timestamp,
  selected,
  onClick,
}: ZonesFrameViewerProps) {
  const frame = useFrame(timestamp);

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
      <SkeletonBox showSkeleton={!frame} width={200} aspectRatio={"16/9"}>
        {frame && (
          <img
            src={frame}
            width={"100%"}
            onClick={onClick}
            style={{ cursor: "pointer" }}
          />
        )}
      </SkeletonBox>
      <Typography textAlign={"center"}>{getPrettyTime(timestamp)}</Typography>
    </Stack>
  );
}

interface ZoneEditorLeftProps {
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
  setZoneView: (view: ZonesEditorView) => void;
}

function ZonesEditorSingleFrameLeft({
  timestamps,
  selectedTimestamp,
  setSelectedTimestamp,
  setZoneView,
}: ZoneEditorLeftProps) {
  const frame = useFrame(selectedTimestamp);
  const { stage } = useStage();
  const { zones, setZones } = useZones();

  const transforms = Array.from(zones)
    .map(([, zone]) => zone)
    .map(getZoneTransforms);

  const rectangles = getRectangles(transforms);

  const setRectangles = (rectangles: Rectangles) => {
    setTransforms(rectangles, transforms, (transforms: Transforms[]) =>
      setZoneTransforms(stage, zones, transforms, setZones, timestamps),
    );
  };

  return (
    <Stack spacing={5}>
      <ImageLabeller
        image={frame}
        rectangles={rectangles}
        setRectangles={setRectangles}
      />
      <ZoneEditorViewToggles
        zoneView={"Single Frame"}
        setZoneView={setZoneView}
      />
      <ZonesFramesViewer
        timestamps={timestamps}
        selectedTimestamp={selectedTimestamp}
        setSelectedTimestamp={setSelectedTimestamp}
      />
    </Stack>
  );
}

interface ZoneEditorRightProps {
  timestamp: number;
}

function ZonesEditorSingleFrameRight({ timestamp }: ZoneEditorRightProps) {
  const { zones } = useZones();
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
      {Array.from(zones.keys()).map((id) => (
        <ZoneProvider key={id} id={id}>
          <ZoneEditor timestamp={timestamp} />
        </ZoneProvider>
      ))}
    </Stack>
  );
}

interface ZoneEditorBodyProps {
  timestamp: number;
}

function ZoneEditorBody({ timestamp }: ZoneEditorBodyProps) {
  const { transformResults } = useZoneResults(timestamp);

  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <TransformResultViewer results={transformResults} />
    </Stack>
  );
}

interface ZoneEditorProps {
  timestamp: number;
}

function ZoneEditor({ timestamp }: ZoneEditorProps) {
  const { zone, setZone, deleteZone } = useZone();

  return (
    <BoxWithHeaderActions
      name={zone.name}
      setName={(name) => setZone({ ...zone, name })}
      actions={[{ onDelete: deleteZone }]}
      body={<ZoneEditorBody timestamp={timestamp} />}
    />
  );
}

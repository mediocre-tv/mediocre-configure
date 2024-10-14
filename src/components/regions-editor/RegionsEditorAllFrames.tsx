import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { useEffect, useState } from "react";
import { Box, IconButton, Stack, useMediaQuery, useTheme } from "@mui/material";
import { RegionProvider } from "../providers/region/RegionProvider.tsx";
import { useConfiguration } from "../providers/configuration/useConfiguration.ts";
import { TransformResultViewer } from "../transform/TransformResultViewer.tsx";
import { AddAPhoto } from "@mui/icons-material";
import { useVideoFrame } from "../frame-selector/useVideoFrame.ts";
import { usePrevious } from "react-use";
import { VideoWithHiddenCanvas } from "../frame-selector/VideoWithHiddenCanvas.tsx";
import {
  RegionEditorViewToggles,
  RegionsEditorView,
} from "./RegionsEditor.tsx";
import { useFrame } from "../providers/frame/useFrame.ts";
import { useRegion } from "../providers/region/useRegion.ts";
import { getPrettyTime } from "../../utilities/timestamp.ts";
import { useZoneRegions } from "../providers/region/useZoneRegions.ts";
import { useRegionResult } from "../providers/region/useRegionResult.ts";

export interface RegionsEditorAllFramesProps {
  setRegionView: (view: RegionsEditorView) => void;
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
}

export function RegionsEditorAllFrames({
  setRegionView,
  timestamps,
  selectedTimestamp,
  setSelectedTimestamp,
}: RegionsEditorAllFramesProps) {
  const { regions } = useZoneRegions();
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(
    regions.keys().next()?.value ?? null,
  );

  return (
    <LongOrSideBySideLayout
      leftChild={
        <RegionsEditorAllFramesLeft
          setRegionView={setRegionView}
          selectedTimestamp={selectedTimestamp}
          setSelectedRegionId={setSelectedRegionId}
        />
      }
      rightChild={
        <RegionsEditorAllFramesRight
          timestamps={timestamps}
          setSelectedTimestamp={setSelectedTimestamp}
          selectedRegionId={selectedRegionId}
        />
      }
    />
  );
}

interface RegionsEditorAllFramesLeftProps {
  setRegionView: (view: RegionsEditorView) => void;
  selectedTimestamp: number;
  setSelectedRegionId: (regionId: string) => void;
}

function RegionsEditorAllFramesLeft({
  setRegionView,
  selectedTimestamp,
  setSelectedRegionId,
}: RegionsEditorAllFramesLeftProps) {
  const { configuration } = useConfiguration();
  const { regions, setRegions } = useZoneRegions();
  const [videoReady, setVideoReady] = useState(false);
  const { videoRef, canvasRef, getTimestamp, seek } = useVideoFrame(() =>
    setVideoReady(true),
  );

  const previousSelectedTime = usePrevious(selectedTimestamp);
  useEffect(() => {
    if (selectedTimestamp && selectedTimestamp !== previousSelectedTime) {
      seek(selectedTimestamp);
    }
  }, [previousSelectedTime, seek, selectedTimestamp]);

  const fallbackImage = useFrame(selectedTimestamp);

  const onAddScreenshot = () => {
    const time = getTimestamp();

    regions.forEach((region) => {
      if (!region.tests.find((test) => test.time === time)) {
        region.tests.push({
          time: time,
          value: "",
        });
      }
    });
    setRegions(regions);
  };

  return (
    <Stack spacing={5}>
      <VideoWithHiddenCanvas
        videoReady={videoReady}
        videoRef={videoRef}
        canvasRef={canvasRef}
        videoUrl={configuration.videoUrl}
        fallbackImage={fallbackImage}
      />
      <Stack direction={"row"} sx={{ position: "relative" }}>
        <RegionEditorViewToggles
          regionView={"All Frames"}
          setRegionView={setRegionView}
        />
        <Stack
          direction={"row"}
          spacing={1}
          sx={{ position: "absolute", right: 0 }}
        >
          <IconButton onClick={onAddScreenshot}>
            <AddAPhoto></AddAPhoto>
          </IconButton>
        </Stack>
      </Stack>
      <RegionListViewer
        timestamp={selectedTimestamp}
        setSelectedRegionId={setSelectedRegionId}
      />
    </Stack>
  );
}

interface RegionListViewerProps {
  timestamp: number;
  setSelectedRegionId: (id: string) => void;
}

function RegionListViewer({
  timestamp,
  setSelectedRegionId,
}: RegionListViewerProps) {
  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));
  const { regions } = useZoneRegions();

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
      {Array.from(regions.keys()).map((id) => (
        <RegionProvider key={id} id={id}>
          <RegionFrameViewer
            timestamp={timestamp}
            onClick={() => setSelectedRegionId(id)}
          />
        </RegionProvider>
      ))}
    </Stack>
  );
}

interface RegionFrameTimeViewerProps {
  timestamp: number;
  onClick: () => void;
}

function RegionFrameTimeViewer({
  timestamp,
  onClick,
}: RegionFrameTimeViewerProps) {
  const { result } = useRegionResult(timestamp);

  return (
    <Box>
      <TransformResultViewer
        label={getPrettyTime(timestamp)}
        result={result}
        onClick={onClick}
      />
    </Box>
  );
}

interface RegionFrameViewerProps {
  timestamp: number;
  onClick: () => void;
}

function RegionFrameViewer({ timestamp, onClick }: RegionFrameViewerProps) {
  const { region } = useRegion();
  const { result } = useRegionResult(timestamp);

  return (
    <Box>
      <TransformResultViewer
        label={region.name}
        result={result}
        onClick={onClick}
      />
    </Box>
  );
}

interface RegionsEditorAllFramesRightProps {
  timestamps: number[];
  setSelectedTimestamp: (timestamp: number) => void;
  selectedRegionId: string | null;
}

function RegionsEditorAllFramesRight({
  timestamps,
  setSelectedTimestamp,
  selectedRegionId,
}: RegionsEditorAllFramesRightProps) {
  return (
    <Stack
      direction={"row"}
      justifyContent={"center"}
      spacing={1}
      useFlexGap
      sx={{
        flexWrap: "wrap",
      }}
    >
      {selectedRegionId &&
        timestamps.map((timestamp) => (
          <RegionProvider key={timestamp} id={selectedRegionId}>
            <RegionFrameTimeViewer
              timestamp={timestamp}
              onClick={() => setSelectedTimestamp(timestamp)}
            />
          </RegionProvider>
        ))}
    </Stack>
  );
}

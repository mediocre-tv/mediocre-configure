import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { useEffect, useState } from "react";
import { Box, IconButton, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useZones } from "../providers/zone/useZones.ts";
import { ZoneProvider } from "../providers/zone/ZoneProvider.tsx";
import { useZoneResults } from "../providers/zone/useZoneResults.ts";
import { useConfiguration } from "../providers/configuration/useConfiguration.ts";
import { TransformResultViewer } from "./TransformResultViewer.tsx";
import { AddAPhoto } from "@mui/icons-material";
import { useVideoFrame } from "../frame-selector/useVideoFrame.ts";
import { usePrevious } from "react-use";
import { VideoWithHiddenCanvas } from "../frame-selector/VideoWithHiddenCanvas.tsx";
import { ZoneEditorViewToggles, ZonesEditorView } from "./ZonesEditor.tsx";
import { useFrame } from "../providers/frame/useFrame.ts";
import { useZone } from "../providers/zone/useZone.ts";
import { getPrettyTime } from "../../utilities/timestamp.ts";

export interface ZonesEditorAllFramesProps {
  setZoneView: (view: ZonesEditorView) => void;
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
}

export function ZonesEditorAllFrames({
  setZoneView,
  timestamps,
  selectedTimestamp,
  setSelectedTimestamp,
}: ZonesEditorAllFramesProps) {
  const { zones } = useZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    zones.keys().next()?.value ?? null,
  );

  return (
    <LongOrSideBySideLayout
      leftChild={
        <ZonesEditorAllFramesLeft
          setZoneView={setZoneView}
          selectedTimestamp={selectedTimestamp}
          setSelectedZoneId={setSelectedZoneId}
        />
      }
      rightChild={
        <ZonesEditorAllFramesRight
          timestamps={timestamps}
          setSelectedTimestamp={setSelectedTimestamp}
          selectedZoneId={selectedZoneId}
        />
      }
    />
  );
}

interface ZonesEditorAllFramesLeftProps {
  setZoneView: (view: ZonesEditorView) => void;
  selectedTimestamp: number;
  setSelectedZoneId: (zoneId: string) => void;
}

function ZonesEditorAllFramesLeft({
  setZoneView,
  selectedTimestamp,
  setSelectedZoneId,
}: ZonesEditorAllFramesLeftProps) {
  const { configuration } = useConfiguration();
  const { zones, setZones } = useZones();
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

    zones.forEach((zone) => {
      if (!zone.tests.find((test) => test.time === time)) {
        zone.tests.push({
          time: time,
          visible: true,
        });
      }
    });
    setZones(zones);
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
        <ZoneEditorViewToggles
          zoneView={"All Frames"}
          setZoneView={setZoneView}
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
      <ZoneListViewer
        timestamp={selectedTimestamp}
        setSelectedZoneId={setSelectedZoneId}
      />
    </Stack>
  );
}

interface ZoneListViewerProps {
  timestamp: number;
  setSelectedZoneId: (id: string) => void;
}

function ZoneListViewer({ timestamp, setSelectedZoneId }: ZoneListViewerProps) {
  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));
  const { zones } = useZones();

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
      {Array.from(zones.keys()).map((id) => (
        <ZoneProvider key={id} id={id}>
          <ZoneFrameViewer
            timestamp={timestamp}
            onClick={() => setSelectedZoneId(id)}
          />
        </ZoneProvider>
      ))}
    </Stack>
  );
}

interface ZoneFrameTimeViewerProps {
  timestamp: number;
  onClick: () => void;
}

function ZoneFrameTimeViewer({ timestamp, onClick }: ZoneFrameTimeViewerProps) {
  const { transformResults } = useZoneResults(timestamp);

  return (
    <Box>
      <TransformResultViewer
        label={getPrettyTime(timestamp)}
        results={transformResults}
        onClick={onClick}
      />
    </Box>
  );
}

interface ZoneFrameViewerProps {
  timestamp: number;
  onClick: () => void;
}

function ZoneFrameViewer({ timestamp, onClick }: ZoneFrameViewerProps) {
  const { zone } = useZone();
  const { transformResults } = useZoneResults(timestamp);

  return (
    <Box>
      <TransformResultViewer
        label={zone.name}
        results={transformResults}
        onClick={onClick}
      />
    </Box>
  );
}

interface ZonesEditorAllFramesRightProps {
  timestamps: number[];
  setSelectedTimestamp: (timestamp: number) => void;
  selectedZoneId: string | null;
}

function ZonesEditorAllFramesRight({
  timestamps,
  setSelectedTimestamp,
  selectedZoneId,
}: ZonesEditorAllFramesRightProps) {
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
      {selectedZoneId &&
        timestamps.map((timestamp) => (
          <ZoneProvider key={timestamp} id={selectedZoneId}>
            <ZoneFrameTimeViewer
              timestamp={timestamp}
              onClick={() => setSelectedTimestamp(timestamp)}
            />
          </ZoneProvider>
        ))}
    </Stack>
  );
}

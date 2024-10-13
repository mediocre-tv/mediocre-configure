import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { ReactNode, useState } from "react";
import { FrameSelector } from "../frame-selector/FrameSelector.tsx";
import { Stack, useMediaQuery, useTheme } from "@mui/material";
import { useZones } from "../providers/zone/useZones.ts";
import { ZoneProvider } from "../providers/zone/ZoneProvider.tsx";
import { useZoneResults } from "../providers/zone/useZoneResults.ts";
import { useConfiguration } from "../providers/configuration/useConfiguration.ts";
import { TransformResultViewer } from "./TransformResultViewer.tsx";

export interface ZonesEditorAllFramesProps {
  changeViewToggles: ReactNode;
  timestamps: number[];
  selectedTimestamp: number;
  setSelectedTimestamp: (time: number) => void;
}

export function ZonesEditorAllFrames({
  changeViewToggles,
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
          changeViewToggles={changeViewToggles}
          selectedTimestamp={selectedTimestamp}
          selectedZoneId={selectedZoneId}
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
  changeViewToggles: ReactNode;
  selectedTimestamp: number;
  selectedZoneId: string | null;
  setSelectedZoneId: (zoneId: string) => void;
}

function ZonesEditorAllFramesLeft({
  changeViewToggles,
  selectedTimestamp,
  selectedZoneId,
  setSelectedZoneId,
}: ZonesEditorAllFramesLeftProps) {
  const { configuration } = useConfiguration();

  return (
    <Stack spacing={5}>
      <FrameSelector
        videoUrl={configuration.videoUrl}
        selectedTime={selectedTimestamp}
      />
      {changeViewToggles}
      <ZoneListViewer
        timestamp={selectedTimestamp}
        selectedZoneId={selectedZoneId}
        setSelectedZoneId={setSelectedZoneId}
      />
    </Stack>
  );
}

interface ZoneListViewerProps {
  timestamp: number;
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string) => void;
}

function ZoneListViewer({
  timestamp,
  selectedZoneId,
  setSelectedZoneId,
}: ZoneListViewerProps) {
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

interface ZoneFrameViewerParams {
  timestamp: number;
  onClick: () => void;
}

function ZoneFrameViewer({ timestamp, onClick }: ZoneFrameViewerParams) {
  const { transformResults } = useZoneResults(timestamp);

  return (
    <TransformResultViewer
      timestamp={timestamp}
      results={transformResults}
      onClick={onClick}
    />
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
            <ZoneFrameViewer
              timestamp={timestamp}
              onClick={() => setSelectedTimestamp(timestamp)}
            />
          </ZoneProvider>
        ))}
    </Stack>
  );
}

import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { ReactNode, useState } from "react";
import { FrameSelector } from "../frame-selector/FrameSelector.tsx";
import { Stack, Typography } from "@mui/material";
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
  setSelectedZoneId: (zoneId: string) => void;
}

function ZonesEditorAllFramesLeft({
  changeViewToggles,
  selectedTimestamp,
  setSelectedZoneId,
}: ZonesEditorAllFramesLeftProps) {
  const { configuration } = useConfiguration();
  const { zones } = useZones();

  return (
    <Stack spacing={5}>
      <FrameSelector
        videoUrl={configuration.videoUrl}
        selectedTime={selectedTimestamp}
      />
      {changeViewToggles}
      {Array.from(zones.entries()).map(([id, zone]) => (
        <Stack
          key={id}
          border={1}
          borderRadius={1}
          padding={1}
          margin={1}
          onClick={() => setSelectedZoneId(id)}
          sx={{ cursor: "pointer" }}
        >
          <Typography>{zone.name}</Typography>
        </Stack>
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

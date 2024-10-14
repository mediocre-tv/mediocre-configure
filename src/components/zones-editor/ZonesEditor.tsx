import { useState } from "react";
import { ZonesEditorSingleFrame } from "./ZonesEditorSingleFrame.tsx";
import { ZonesEditorAllFrames } from "./ZonesEditorAllFrames.tsx";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useStageZones } from "../providers/zone/useStageZones.ts";

const zonesEditorViews = ["Single Frame", "All Frames"] as const;
export type ZonesEditorView = (typeof zonesEditorViews)[number];

export function ZonesEditor() {
  const { stage, zones } = useStageZones();

  const zonesTimestamps = Array.from(zones.values()).flatMap((zone) =>
    zone.tests.map((test) => test.time),
  );
  const stageTimestamps = stage.tests[0].times;
  const timestamps = [
    ...new Set(zonesTimestamps.length > 0 ? zonesTimestamps : stageTimestamps),
  ];

  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(
    timestamps[0],
  );

  const [zoneView, setZoneView] = useState<ZonesEditorView>("Single Frame");

  return zoneView === "Single Frame" ? (
    <ZonesEditorSingleFrame
      setZoneView={setZoneView}
      timestamps={timestamps}
      selectedTimestamp={selectedTimestamp}
      setSelectedTimestamp={setSelectedTimestamp}
    />
  ) : (
    <ZonesEditorAllFrames
      setZoneView={setZoneView}
      timestamps={timestamps}
      selectedTimestamp={selectedTimestamp}
      setSelectedTimestamp={setSelectedTimestamp}
    />
  );
}

interface ZoneEditorViewTogglesProps {
  regionView: ZonesEditorView;
  setRegionView: (view: ZonesEditorView) => void;
}

export function ZoneEditorViewToggles({
  regionView,
  setRegionView,
}: ZoneEditorViewTogglesProps) {
  return (
    <Box width={1} display={"flex"} justifyContent={"center"}>
      <ToggleButtonGroup
        exclusive
        value={regionView}
        onChange={(_, value) => setRegionView(value)}
      >
        {zonesEditorViews.map((view) => (
          <ToggleButton key={view} value={view} sx={{ textTransform: "none" }}>
            {view}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

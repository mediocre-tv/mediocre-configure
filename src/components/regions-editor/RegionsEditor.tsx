import { RegionsEditorSingleFrame } from "./RegionsEditorSingleFrame.tsx";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";
import { RegionsEditorAllFrames } from "./RegionsEditorAllFrames.tsx";
import { useZoneRegions } from "../providers/region/useZoneRegions.ts";

const regionsEditorViews = ["Single Frame", "All Frames"] as const;
export type RegionsEditorView = (typeof regionsEditorViews)[number];

export function RegionsEditor() {
  const { zone, regions } = useZoneRegions();

  const regionsTimestamps = Array.from(regions.values()).flatMap((region) =>
    region.tests.map((test) => test.time),
  );
  const zoneTimestamps = zone.tests.map((test) => test.time);
  const timestamps = [
    ...new Set(
      regionsTimestamps.length > 0 ? regionsTimestamps : zoneTimestamps,
    ),
  ];

  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(
    timestamps[0],
  );

  const [regionView, setRegionView] =
    useState<RegionsEditorView>("Single Frame");

  return regionView === "Single Frame" ? (
    <RegionsEditorSingleFrame
      setRegionView={setRegionView}
      timestamps={timestamps}
      selectedTimestamp={selectedTimestamp}
      setSelectedTimestamp={setSelectedTimestamp}
    />
  ) : (
    <RegionsEditorAllFrames
      setRegionView={setRegionView}
      timestamps={timestamps}
      selectedTimestamp={selectedTimestamp}
      setSelectedTimestamp={setSelectedTimestamp}
    />
  );
}

interface RegionEditorViewTogglesProps {
  regionView: RegionsEditorView;
  setRegionView: (view: RegionsEditorView) => void;
}

export function RegionEditorViewToggles({
  regionView,
  setRegionView,
}: RegionEditorViewTogglesProps) {
  return (
    <Box width={1} display={"flex"} justifyContent={"center"}>
      <ToggleButtonGroup
        exclusive
        value={regionView}
        onChange={(_, value) => setRegionView(value)}
      >
        {regionsEditorViews.map((view) => (
          <ToggleButton key={view} value={view} sx={{ textTransform: "none" }}>
            {view}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

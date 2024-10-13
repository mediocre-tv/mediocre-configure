import { useState } from "react";
import { ZonesEditorSingleFrame } from "./ZonesEditorSingleFrame.tsx";
import { ZonesEditorAllFrames } from "./ZonesEditorAllFrames.tsx";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useStage } from "../providers/stage/useStage.ts";
import { useZones } from "../providers/zone/useZones.ts";

const zonesEditorViews = ["Single Frame", "All Frames"] as const;
type ZonesEditorView = (typeof zonesEditorViews)[number];

export function ZonesEditor() {
  const [zoneView, setZoneView] = useState<ZonesEditorView>("Single Frame");

  const changeViewToggles = (
    <Box width={1} display={"flex"} justifyContent={"center"}>
      <ToggleButtonGroup
        exclusive
        value={zoneView}
        onChange={(_, value) => setZoneView(value)}
      >
        {zonesEditorViews.map((view) => (
          <ToggleButton key={view} value={view} sx={{ textTransform: "none" }}>
            {view}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );

  const { stage } = useStage();
  const { zones } = useZones();

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

  return zoneView === "Single Frame" ? (
    <ZonesEditorSingleFrame
      changeViewToggles={changeViewToggles}
      timestamps={timestamps}
      selectedTimestamp={selectedTimestamp}
      setSelectedTimestamp={setSelectedTimestamp}
    />
  ) : (
    <ZonesEditorAllFrames
      changeViewToggles={changeViewToggles}
      timestamps={timestamps}
      selectedTimestamp={selectedTimestamp}
      setSelectedTimestamp={setSelectedTimestamp}
    />
  );
}

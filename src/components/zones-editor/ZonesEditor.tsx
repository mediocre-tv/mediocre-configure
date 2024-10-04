import { useState } from "react";
import { ZonesEditorSingleFrame } from "./ZonesEditorSingleFrame.tsx";
import { ZonesEditorAllFrames } from "./ZonesEditorAllFrames.tsx";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const zonesEditorViews = ["Single Frame", "All Frames"] as const;
type ZonesEditorView = (typeof zonesEditorViews)[number];

export interface ZonesEditorProps {
  stageId: string;
}

export function ZonesEditor({ stageId }: ZonesEditorProps) {
  const [zoneView, setZoneView] = useState<ZonesEditorView>("Single Frame");

  const changeViewToggles = (
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
  );

  return zoneView === "Single Frame" ? (
    <ZonesEditorSingleFrame
      stageId={stageId}
      changeViewToggles={changeViewToggles}
    />
  ) : (
    <ZonesEditorAllFrames
      stageId={stageId}
      changeViewToggles={changeViewToggles}
    />
  );
}

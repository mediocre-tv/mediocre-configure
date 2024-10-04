import { useState } from "react";
import { ZonesEditorSingleFrame } from "./ZonesEditorSingleFrame.tsx";
import { ZonesEditorAllFrames } from "./ZonesEditorAllFrames.tsx";

export type ZoneView = "Single Frame" | "All Frames";

export interface ZonesEditorProps {
  stageId: string;
}

export function ZonesEditor({ stageId }: ZonesEditorProps) {
  const [zoneView, setZoneView] = useState<ZoneView>("Single Frame");

  return zoneView === "Single Frame" ? (
    <ZonesEditorSingleFrame stageId={stageId} onChangeView={setZoneView} />
  ) : (
    <ZonesEditorAllFrames />
  );
}

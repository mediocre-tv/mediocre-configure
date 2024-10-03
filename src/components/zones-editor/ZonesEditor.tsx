import snapshotImage from "../../assets/snapshot-2.png";
import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { ZonesEditorLeft } from "./ZonesEditorLeft.tsx";
import { Stack, Typography } from "@mui/material";
import { useZones } from "../configuration/ConfigurationContext.ts";

export interface ZonesEditorProps {
  stageId: string;
}

export function ZonesEditor({ stageId }: ZonesEditorProps) {
  const zonesContext = useZones(stageId);
  if (!zonesContext) {
    return null;
  }

  const { zones, setZones } = zonesContext;
  const image = snapshotImage;
  return (
    <LongOrSideBySideLayout
      leftChild={
        <ZonesEditorLeft image={image} zones={zones} setZones={setZones} />
      }
      rightChild={
        <Stack direction={"row"} sx={{ flexWrap: "wrap" }}>
          {zones.map((zone, index) => (
            <Stack key={index} width={1 / 4} padding={2}>
              <Typography>{zone.name}</Typography>
              <Typography>{zone.id}</Typography>
            </Stack>
          ))}
        </Stack>
      }
    />
  );
}

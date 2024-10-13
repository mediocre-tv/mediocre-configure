import { useParams } from "react-router-dom";
import { StageProvider } from "../components/providers/stage/StageProvider.tsx";
import { ZoneProvider } from "../components/providers/zone/ZoneProvider.tsx";
import { useExpandedId } from "../components/providers/hooks/useExpandedId.ts";

export function Regions() {
  const { stageId, zoneId } = useParams();

  if (!stageId || !zoneId) {
    throw new Error("No stageId or zoneId found");
  }

  const fullStageId = useExpandedId(stageId);
  const fullZoneId = useExpandedId(zoneId);

  return (
    <StageProvider id={fullStageId}>
      <ZoneProvider id={fullZoneId}>
        <RegionsEditor />
      </ZoneProvider>
    </StageProvider>
  );
}

import { useParams } from "react-router-dom";
import { StageProvider } from "../components/providers/stage/StageProvider.tsx";
import { ZoneProvider } from "../components/providers/zone/ZoneProvider.tsx";

export function Regions() {
  const { stageId, zoneId } = useParams();

  if (!stageId || !zoneId) {
    throw new Error("No stageId or zoneId found");
  }

  return (
    <StageProvider id={stageId}>
      <ZoneProvider id={zoneId}>
        <RegionsEditor />
      </ZoneProvider>
    </StageProvider>
  );
}

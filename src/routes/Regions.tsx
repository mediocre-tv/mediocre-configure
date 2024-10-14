import { useParams } from "react-router-dom";
import { StageProvider } from "../components/providers/stage/StageProvider.tsx";
import { ZoneProvider } from "../components/providers/zone/ZoneProvider.tsx";
import { useExpandId } from "../components/providers/hooks/useExpandId.ts";
import { RegionsEditor } from "../components/regions-editor/RegionsEditor.tsx";

export function Regions() {
  const { stageId, zoneId } = useParams();
  const expandId = useExpandId();

  if (!stageId || !zoneId) {
    throw new Error("No stageId or zoneId found");
  }

  return (
    <StageProvider id={expandId(stageId)}>
      <ZoneProvider id={expandId(zoneId)}>
        <RegionsEditor />
      </ZoneProvider>
    </StageProvider>
  );
}

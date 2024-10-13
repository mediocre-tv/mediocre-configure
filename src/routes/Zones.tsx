import { useParams } from "react-router-dom";
import { StageProvider } from "../components/providers/stage/StageProvider.tsx";
import { ZonesEditor } from "../components/zones-editor/ZonesEditor.tsx";
import { useExpandId } from "../components/providers/hooks/useExpandId.ts";

export function Zones() {
  const { stageId } = useParams();
  const expandId = useExpandId();

  if (!stageId) {
    throw new Error("No stageId found");
  }

  return (
    <StageProvider id={expandId(stageId)}>
      <ZonesEditor />
    </StageProvider>
  );
}

import { useParams } from "react-router-dom";
import { StageProvider } from "../components/providers/stage/StageProvider.tsx";
import { ZonesEditor } from "../components/zones-editor/ZonesEditor.tsx";
import { useExpandedId } from "../components/providers/hooks/useExpandedId.ts";

export function Zones() {
  const { stageId } = useParams();

  if (!stageId) {
    throw new Error("No stageId found");
  }

  const id = useExpandedId(stageId);

  return (
    <StageProvider id={id}>
      <ZonesEditor />
    </StageProvider>
  );
}

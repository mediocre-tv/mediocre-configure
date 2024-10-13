import { useParams } from "react-router-dom";
import { StageProvider } from "../components/providers/stage/StageProvider.tsx";
import { ZonesEditor } from "../components/zones-editor/ZonesEditor.tsx";

export function Zones() {
  const { stageId } = useParams();

  if (!stageId) {
    throw new Error("No stageId found");
  }

  return (
    <StageProvider id={stageId}>
      <ZonesEditor />
    </StageProvider>
  );
}

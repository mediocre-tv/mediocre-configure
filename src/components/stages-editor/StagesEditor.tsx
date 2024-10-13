import { ZonesEditor } from "../zones-editor/ZonesEditor.tsx";
import { StageProvider } from "../providers/stage/StageProvider.tsx";
import { useStages } from "../providers/stage/useStages.ts";

export function StagesEditor() {
  // just assuming a single stage for now
  const { stages } = useStages();
  const firstStageId = stages.keys().next().value;

  if (!firstStageId) {
    throw new Error("No stages found");
  }

  return (
    <StageProvider id={firstStageId}>
      <ZonesEditor />
    </StageProvider>
  );
}

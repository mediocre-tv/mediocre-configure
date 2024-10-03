import { ZonesEditor } from "../zones-editor/ZonesEditor.tsx";
import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useStages } from "../configuration/useStage.ts";

export function StagesEditor() {
  const stagesContext = useStages();

  useEffect(() => {
    if (!stagesContext?.stages) {
      stagesContext?.setStages([{ id: uuid(), name: "Stage 1", zones: [] }]);
    }
  }, [stagesContext]);

  if (!stagesContext) {
    return null;
  }

  const { stages } = stagesContext;
  return <ZonesEditor stageId={stages[0].id} />;
}

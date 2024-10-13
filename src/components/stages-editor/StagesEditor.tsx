import { Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useStages } from "../providers/stage/useStages";
import { useStage } from "../providers/stage/useStage";
import { useFrame } from "../providers/frame/useFrame.ts";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";
import { StageProvider } from "../providers/stage/StageProvider.tsx";
import { useCollapseId } from "../providers/hooks/useCollapseId.ts";

export function StagesEditor() {
  // just assuming a single stage for now
  const { stages } = useStages();
  const firstStageId = stages.keys().next().value;

  if (!firstStageId) {
    throw new Error("No stages found");
  }

  return (
    <Stack display={"flex"} justifyContent={"center"}>
      {Array.from(stages.keys()).map((id) => (
        <StageProvider id={id} key={id}>
          <StageViewer />
        </StageProvider>
      ))}
    </Stack>
  );
}

function StageViewer() {
  const { stage } = useStage();
  const times = stage.tests[0].times;
  const frame = useFrame(times[times.length / 2]);
  const collapseId = useCollapseId();

  return (
    <Stack alignItems={"center"}>
      <SkeletonBox width={400} showSkeleton={!frame}>
        {frame && (
          <img
            src={frame}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        )}
      </SkeletonBox>
      <Typography textAlign={"center"}>
        {`${stage.name} - `}
        <Link to={`/stages/${collapseId(stage.id)}/zones`}>Zones</Link>
      </Typography>
    </Stack>
  );
}

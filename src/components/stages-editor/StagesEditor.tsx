import { ZonesEditor } from "../zones-editor/ZonesEditor.tsx";
import { useEffect } from "react";
import { getRandomTimestamps, getVideoDuration } from "../video/GrabFrames.ts";
import { useStageTest, useStageTests } from "../test-context/useStageTest.ts";
import { Typography } from "@mui/material";

async function getDefaultStageDetails(url: string) {
  const duration = await getVideoDuration(url);
  const timestamps = getRandomTimestamps(0, duration, 10);
  return { start: 0, end: duration, timestamps: timestamps };
}

export function StagesEditor() {
  // just assuming a single stage for now

  const { stageTests, stages, test } = useStageTests();
  const { stageTest, setStageTest } = useStageTest(stageTests.at(0)?.id);

  const url = test.video?.url;
  useEffect(() => {
    if (stageTest.details.length === 0 && url) {
      getDefaultStageDetails(url).then((details) => {
        setStageTest({ ...stageTest, details: [details] });
      });
    }
  }, [setStageTest, stageTest, url]);

  if (stages.length === 0) {
    return <Typography>Loading stages</Typography>;
  }

  return <ZonesEditor stageId={stages[0].id} />;
}

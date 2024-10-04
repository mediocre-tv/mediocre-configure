import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Frame, FrameContext } from "./FrameContext.ts";
import { useConfigurationTest } from "../test-context/useConfigurationTest.ts";
import { Typography } from "@mui/material";
import { getFramesFromVideo } from "../video/GrabFrames.ts";

export function FrameProvider({ children }: PropsWithChildren) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const configurationTestContext = useConfigurationTest();
  const videoUrl = configurationTestContext?.test.video?.url;

  const timestamps = useMemo(
    () =>
      configurationTestContext?.test.stages.flatMap((stage) => [
        ...stage.details.flatMap((stageDetails) => stageDetails.timestamps),
        ...stage.zones.flatMap((zone) => [
          ...zone.details.flatMap((zoneDetails) => zoneDetails.timestamp),
          ...zone.regions.flatMap((region) =>
            region.details.flatMap((regionDetails) => regionDetails.timestamp),
          ),
        ]),
      ]),
    [configurationTestContext],
  );

  useEffect(() => {
    const newTimestamps = timestamps?.filter(
      (timestamp) => !frames.find((frame) => frame.time === timestamp),
    );
    if (newTimestamps.length > 0 && videoUrl) {
      getFramesFromVideo(videoUrl, newTimestamps).then((newFrames) =>
        setFrames((frames) => {
          const framesToAdd = newFrames.filter(
            (newFrame) => !frames.find((frame) => frame.time === newFrame.time),
          );
          const combinedFrames = [...frames, ...framesToAdd];
          return combinedFrames.sort((a, b) => (a.time < b.time ? -1 : 1));
        }),
      );
    }
  }, [frames, timestamps, videoUrl]);

  if (!configurationTestContext) {
    return <Typography>Could not provide frames</Typography>;
  }

  return (
    <FrameContext.Provider value={{ frames }}>{children}</FrameContext.Provider>
  );
}

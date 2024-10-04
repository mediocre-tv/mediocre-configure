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
    const abortController = new AbortController();
    const signal = abortController.signal;

    const newTimestamps = timestamps?.filter(
      (timestamp) => !frames.find((frame) => frame.time === timestamp),
    );

    const getFrames = async () => {
      if (videoUrl && newTimestamps.length > 0) {
        try {
          const newFrames = await getFramesFromVideo(
            videoUrl,
            newTimestamps,
            signal,
          );
          if (!signal.aborted) {
            return setSortedFrames(newFrames);
          }
        } catch (error) {
          if (!signal.aborted) {
            throw error;
          }
        }
      }
    };

    getFrames();

    return () => {
      abortController.abort();
    };
  }, [frames, timestamps, videoUrl]);

  if (!configurationTestContext) {
    return <Typography>Could not provide frames</Typography>;
  }

  return (
    <FrameContext.Provider value={{ frames }}>{children}</FrameContext.Provider>
  );

  function setSortedFrames(newFrames: Frame[]) {
    return setFrames((frames) => {
      const framesToAdd = newFrames.filter(
        (newFrame) => !frames.find((frame) => frame.time === newFrame.time),
      );
      const combinedFrames = [...frames, ...framesToAdd];
      return combinedFrames.sort((a, b) => (a.time < b.time ? -1 : 1));
    });
  }
}

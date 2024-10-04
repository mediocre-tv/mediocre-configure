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
    const newTimestamps = timestamps
      ?.filter((timestamp) => !frames.find((frame) => frame.time === timestamp))
      .sort();

    if (newTimestamps.length > 0) {
      setSortedFrames(newTimestamps.map((time) => ({ time })));
    }
  }, [frames, timestamps]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const framesWithoutImages = frames.filter((frame) => !frame.image);

    const getFrames = async () => {
      if (videoUrl && framesWithoutImages.length > 0) {
        try {
          await getFramesFromVideo(
            videoUrl,
            framesWithoutImages.map((frame) => frame.time),
            (frame: Frame) => setSortedFrames([frame]),
            signal,
          );
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
  }, [frames, videoUrl]);

  if (!configurationTestContext) {
    return <Typography>Could not provide frames</Typography>;
  }

  return (
    <FrameContext.Provider value={{ frames }}>{children}</FrameContext.Provider>
  );

  function setSortedFrames(newFrames: Frame[]) {
    return setFrames((frames) => [
      ...newFrames.reduce((acc, newFrame) => {
        const frameIndex = acc.findIndex(
          (frame) => frame.time === newFrame.time,
        );
        if (frameIndex === -1) {
          return [...acc, newFrame].sort((a, b) => a.time - b.time);
        } else if (!acc[frameIndex].image) {
          acc[frameIndex] = newFrame;
        }
        return acc;
      }, frames),
    ]);
  }
}

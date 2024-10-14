import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FrameContext, Frames } from "./FrameContext.ts";
import { getFramesFromVideo } from "../../video/GrabFrames.ts";
import { useConfiguration } from "../configuration/useConfiguration.ts";

function useTimestamps() {
  const { stages, zones, regions } = useConfiguration();

  return useMemo(() => {
    const stageTimestamps = Array.from(stages.values()).flatMap((stage) =>
      stage.tests.flatMap((test) => test.times),
    );
    const zoneTimestamps = Array.from(zones.values()).flatMap((zone) =>
      zone.tests.flatMap((test) => test.time),
    );
    const regionTimestamps = Array.from(regions.values()).flatMap((region) =>
      region.tests.flatMap((test) => test.time),
    );
    return [...stageTimestamps, ...zoneTimestamps, ...regionTimestamps].sort(
      (a, b) => a - b,
    );
  }, [stages, zones, regions]);
}

export function FrameProvider({ children }: PropsWithChildren) {
  const timestamps = useTimestamps();
  const [frames, setFrames] = useState<Frames>(new Map());
  const { configuration } = useConfiguration();
  const videoUrl = configuration.videoUrl;

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const timestampsWithFrames = Array.from(frames.keys());
    const timestampsWithoutFrames = timestamps.filter(
      (timestamp) => !timestampsWithFrames.includes(timestamp),
    );

    const getFrames = async () => {
      if (videoUrl && timestampsWithoutFrames.length > 0) {
        try {
          await getFramesFromVideo(
            videoUrl,
            timestampsWithoutFrames,
            (timestamp: number, frame: string) => {
              setFrames(
                (frames) =>
                  new Map(
                    Array.from(frames.set(timestamp, frame)).sort(
                      ([a], [b]) => a - b,
                    ),
                  ),
              );
            },
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
  }, [frames, timestamps, videoUrl]);

  return (
    <FrameContext.Provider value={{ frames }}>{children}</FrameContext.Provider>
  );
}

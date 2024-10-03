import { Configuration } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import {
  Test,
  Video,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/test/v1beta/test_pb";
import { PropsWithChildren, useEffect, useState } from "react";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { TestProvider } from "./TestProvider.tsx";
import { v4 as uuid } from "uuid";
import VideoDialog from "./VideoDialog.tsx";

function getDefaultTest(configuration: Configuration, video: Video): Test {
  return {
    id: uuid(),
    name: `Test for ${configuration.name}`,
    configuration: configuration,
    video: video,
    stages: configuration.stages.map((stage) => ({
      id: stage.id,
      details: [],
      zones: stage.zones.map((zone) => ({
        id: zone.id,
        details: [],
        regions: zone.regions.map((region) => ({
          id: region.id,
          details: [],
        })),
      })),
    })),
  };
}

export interface TestProviderDialogProps {
  configuration: Configuration;
}

export function TestProviderWithDialog({
  children,
  configuration,
}: PropsWithChildren<TestProviderDialogProps>) {
  const [test, setTest] = useLocalState<Test | null>(null, "test");
  const [error, setError] = useState<string | null>(null);

  const onSelectVideo = (name: string, video: string) => {
    if (test && test.video?.name) {
      if (test.video.name === name) {
        setTest({ ...test, video: { name, url: video } });
      } else {
        setError("Name of video must match the name of the video in the test");
      }
    } else {
      setTest(getDefaultTest(configuration, { name, url: video }));
    }
  };

  useEffect(() => {
    if (test?.video) {
      fetch(test?.video.url)
        .then(() => setError(null))
        .catch((error) => setError(error.message ?? "Unknown error"));
    }
  }, [test?.video]);

  return (
    <>
      <VideoDialog
        open={!test || !!error}
        error={error}
        video={test?.video}
        onSelectVideo={onSelectVideo}
      />
      <TestProvider test={test} setTest={setTest}>
        {children}
      </TestProvider>
    </>
  );
}

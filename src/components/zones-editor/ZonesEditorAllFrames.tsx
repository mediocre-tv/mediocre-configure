import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { ReactNode, useState } from "react";
import { FrameSelector } from "../frame-selector/FrameSelector.tsx";
import { useConfigurationTest } from "../test-context/useConfigurationTest.ts";
import { useFrames } from "../frame-context/useFrames.ts";
import { useStageTest } from "../test-context/useStageTest.ts";
import { Frame } from "../frame-context/FrameContext.ts";
import { Stack, Typography } from "@mui/material";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";
import { useTransform } from "../grpc/GrpcContext.ts";
import { useImageData } from "../image/useImageData.ts";
import { useZone, useZones } from "../configuration/useZone.ts";
import { getZoneTransforms } from "./ZonesEditorSingleFrame.tsx";

export interface ZonesEditorAllFramesProps {
  stageId: string;
  changeViewToggles: ReactNode;
}

export function ZonesEditorAllFrames({
  stageId,
  changeViewToggles,
}: ZonesEditorAllFramesProps) {
  const { stageTest, stage } = useStageTest(stageId);
  const timestamps = stageTest.details.flatMap((details) => details.timestamps);

  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    stage.zones.at(0)?.id ?? null,
  );
  const { frames, setFrames } = useFrames(timestamps);

  return (
    <LongOrSideBySideLayout
      leftChild={
        <ZonesEditorAllFramesLeft
          stageId={stageId}
          changeViewToggles={changeViewToggles}
          addFrame={(frame) => setFrames([...frames, frame])}
          selectedFrame={selectedFrame}
          setSelectedZoneId={setSelectedZoneId}
        />
      }
      rightChild={
        <ZonesEditorAllFramesRight
          frames={frames}
          setSelectedFrame={setSelectedFrame}
          selectedZoneId={selectedZoneId}
        />
      }
    />
  );
}

interface ZonesEditorAllFramesLeftProps {
  stageId: string;
  changeViewToggles: ReactNode;
  addFrame: (frames: Frame) => void;
  selectedFrame: Frame | null;
  setSelectedZoneId: (zoneId: string) => void;
}

function ZonesEditorAllFramesLeft({
  stageId,
  changeViewToggles,
  addFrame,
  selectedFrame,
  setSelectedZoneId,
}: ZonesEditorAllFramesLeftProps) {
  const { test } = useConfigurationTest();
  const { zones } = useZones(stageId);

  return (
    <Stack>
      <FrameSelector
        videoUrl={test.video?.url ?? null}
        addFrame={addFrame}
        selectedFrame={selectedFrame}
      />
      {changeViewToggles}
      {zones.map((zone) => (
        <Stack
          key={zone.id}
          border={1}
          borderRadius={1}
          padding={1}
          margin={1}
          onClick={() => setSelectedZoneId(zone.id)}
          sx={{ cursor: "pointer" }}
        >
          <Typography>{zone.name}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

interface ZoneFrameViewerParams {
  onClick: () => void;
  frame: Frame;
  selectedZoneId: string | null;
}

function ZoneFrameViewer({
  onClick,
  frame,
  selectedZoneId,
}: ZoneFrameViewerParams) {
  const imageData = useImageData(frame.image ?? null);
  const { zone } = useZone(selectedZoneId ?? undefined);

  const zoneImageData = useTransform(
    imageData,
    getZoneTransforms(zone).transformations[0],
    zone.id,
  )?.result;

  const prettyTime = new Date(frame.time * 1000).toISOString().slice(14, 19);

  return (
    <Stack
      margin={1}
      border={1}
      borderRadius={1}
      onClick={onClick}
      sx={{ cursor: "pointer" }}
    >
      <SkeletonBox
        showSkeleton={!zoneImageData}
        width={200}
        aspectRatio={"16/9"}
        boxProps={{ padding: 1 }}
      >
        {zoneImageData instanceof Uint8Array ? (
          <img
            src={URL.createObjectURL(new Blob([zoneImageData]))}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        ) : (
          <Typography>{zoneImageData}</Typography>
        )}
      </SkeletonBox>
      <Typography textAlign={"center"} paddingBottom={1}>
        {prettyTime}
      </Typography>
    </Stack>
  );
}

interface ZonesEditorAllFramesRightProps {
  frames: Frame[];
  setSelectedFrame: (frame: Frame) => void;
  selectedZoneId: string | null;
}

function ZonesEditorAllFramesRight({
  frames,
  setSelectedFrame,
  selectedZoneId,
}: ZonesEditorAllFramesRightProps) {
  return (
    <Stack
      direction={"row"}
      justifyContent={"center"}
      spacing={1}
      useFlexGap
      sx={{
        flexWrap: "wrap",
      }}
    >
      {frames.map((frame, index) => (
        <ZoneFrameViewer
          key={index}
          onClick={() => setSelectedFrame(frame)}
          frame={frame}
          selectedZoneId={selectedZoneId}
        />
      ))}
    </Stack>
  );
}

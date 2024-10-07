import { useZone, useZones } from "../configuration/useZone.ts";
import { LongOrSideBySideLayout } from "../layout/LongOrSideBySideLayout.tsx";
import { Zone } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";
import {
  getRectangles,
  setTransforms,
  Transforms,
} from "../transform/Transforms.ts";
import { isImageToImageTransform } from "../transform/Transform.ts";
import { Rectangles } from "../shapes/Rectangle.tsx";
import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import { useStageTest } from "../test-context/useStageTest.ts";
import { useFrames } from "../frame-context/useFrames.ts";
import { ReactNode, useEffect, useState } from "react";
import { Frame } from "../frame-context/FrameContext.ts";
import { useImageData } from "../image/useImageData.ts";
import styles from "../regions-editor/RegionsEditor.module.css";
import { useTransformClient } from "../grpc/GrpcContext.ts";
import { BoxWithHeaderActions } from "../layout/BoxWithHeaderLayout.tsx";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";

export interface ZonesEditorSingleFrameProps {
  stageId: string;
  changeViewToggles: ReactNode;
}

export function ZonesEditorSingleFrame({
  stageId,
  changeViewToggles,
}: ZonesEditorSingleFrameProps) {
  const { zones } = useZones(stageId);
  const [currentFrame, setCurrentFrame] = useState<Frame | null>(null);

  return (
    <LongOrSideBySideLayout
      leftChild={
        <ZonesEditorSingleFrameLeft
          stageId={stageId}
          currentFrame={currentFrame}
          setCurrentFrame={setCurrentFrame}
          changeViewToggles={changeViewToggles}
        />
      }
      rightChild={
        <ZonesEditorSingleFrameRight
          zones={zones}
          image={currentFrame?.image ?? null}
        />
      }
    />
  );
}

function getZoneTransforms(zone: Zone): Transforms {
  return {
    id: zone.id,
    transformations: zone.transformations.map((transformation) => ({
      transformation: {
        oneofKind: "imageToImage",
        imageToImage: transformation,
      },
    })),
  };
}

function setZoneTransforms(
  transforms: Transforms[],
  setZones: (zones: Zone[]) => void,
) {
  const updatedZones = transforms.map((transform, index) => {
    return Zone.create({
      id: transform.id,
      name: (transform["name"] as string) ?? `Zone ${index + 1}`,
      transformations: transform.transformations
        .filter(isImageToImageTransform)
        .map((transform) => {
          return transform.transformation.imageToImage;
        }),
    });
  });
  setZones(updatedZones);
}

interface ZoneFramesViewerProps {
  stageId: string;
  currentFrame: Frame | null;
  setCurrentFrame: (frame: Frame) => void;
}

function ZoneFramesViewer({
  stageId,
  currentFrame,
  setCurrentFrame,
}: ZoneFramesViewerProps) {
  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));

  const { stageTest } = useStageTest(stageId);
  const timestamps = stageTest.details.flatMap((details) => details.timestamps);

  const frames = useFrames(timestamps);

  useEffect(() => {
    if (!currentFrame?.image && frames.length > 0 && frames[0].image) {
      setCurrentFrame(frames[0]);
    }
  }, [currentFrame, frames, setCurrentFrame]);

  return (
    <Stack
      direction={"row"}
      sx={{
        ...(hasLgBreakpoint
          ? {
              flexWrap: "wrap",
            }
          : {
              overflow: "auto",
            }),
      }}
    >
      {frames
        .filter((frame) => frame.time !== currentFrame?.time)
        .map((frame, index) => (
          <Stack key={index} spacing={1} padding={2}>
            <SkeletonBox
              showSkeleton={!frame.image}
              width={200}
              aspectRatio={"16/9"}
            >
              <img
                src={frame.image}
                width={"100%"}
                onClick={() => setCurrentFrame(frame)}
                style={{ cursor: "pointer" }}
              />
            </SkeletonBox>
            <Typography textAlign={"center"}>
              {frame.time.toFixed(3)}s
            </Typography>
          </Stack>
        ))}
    </Stack>
  );
}

interface ZoneEditorLeftProps {
  stageId: string;
  currentFrame: Frame | null;
  setCurrentFrame: (frame: Frame) => void;
  changeViewToggles: ReactNode;
}

function ZonesEditorSingleFrameLeft({
  stageId,
  currentFrame,
  setCurrentFrame,
  changeViewToggles,
}: ZoneEditorLeftProps) {
  const { zones, setZones } = useZones(stageId);

  const transforms = zones.map(getZoneTransforms);
  const rectangles = getRectangles(transforms);
  const setRectangles = (rectangles: Rectangles) => {
    setTransforms(rectangles, transforms, (transforms: Transforms[]) =>
      setZoneTransforms(transforms, setZones),
    );
  };

  return (
    <Stack spacing={5}>
      <ImageLabeller
        image={currentFrame?.image ?? null}
        rectangles={rectangles}
        setRectangles={setRectangles}
      />
      {changeViewToggles}
      <ZoneFramesViewer
        stageId={stageId}
        currentFrame={currentFrame}
        setCurrentFrame={setCurrentFrame}
      />
    </Stack>
  );
}

interface ZoneEditorRightProps {
  zones: Zone[];
  image: string | null;
}

function ZonesEditorSingleFrameRight({ zones, image }: ZoneEditorRightProps) {
  const imageData = useImageData(image);
  const theme = useTheme();
  const hasLgBreakpoint = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Stack
      height={1}
      spacing={5}
      textAlign={"center"}
      sx={{
        ...(hasLgBreakpoint && {
          overflow: "auto",
        }),
      }}
    >
      {zones.map((zone) => (
        <ZoneEditor key={zone.id} zoneId={zone.id} imageData={imageData} />
      ))}
    </Stack>
  );
}

interface RegionTransformationsBodyProps {
  imageData: Uint8Array | string;
}

function ZoneEditorBody({ imageData }: RegionTransformationsBodyProps) {
  return (
    <Stack
      direction={"row"}
      spacing={2}
      padding={1}
      justifyContent={"space-between"}
      alignItems={"center"}
      overflow="auto"
    >
      <SkeletonBox
        showSkeleton={!(imageData instanceof Uint8Array)}
        boxProps={{ display: "flex", alignItems: "center" }}
        width={200}
        height={200}
      >
        {imageData instanceof Uint8Array ? (
          <img
            src={URL.createObjectURL(new Blob([imageData]))}
            className={styles.image}
          />
        ) : (
          <Typography>{imageData}</Typography>
        )}
      </SkeletonBox>
    </Stack>
  );
}

interface ZoneEditorProps {
  zoneId: string;
  imageData: Uint8Array | null;
}

function ZoneEditor({ zoneId, imageData }: ZoneEditorProps) {
  const { zone, setZone, deleteZone } = useZone(zoneId);
  const results = useTransformClient(
    imageData,
    getZoneTransforms(zone).transformations,
  );
  const zoneImageData = results.at(-1)?.result;
  const setName = (name: string) => setZone({ ...zone, name });

  return (
    <BoxWithHeaderActions
      name={zone.name}
      setName={setName}
      actions={[{ onDelete: deleteZone }]}
      body={<ZoneEditorBody imageData={zoneImageData ?? "No image data"} />}
    />
  );
}

import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangle, Rectangles } from "../shapes/Rectangle.tsx";
import { Fragment, useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useGrpcClient } from "../grpc/GrpcContext.ts";
import styles from "./RegionEditor.module.css";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb.client";
import { TransformToImage } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb";
import { crop, ocr } from "./Transform.ts";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ProtobufEditor from "../protobuf-editor/ProtobufEditor.tsx";
import { Region } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/configuration/v1beta/configuration_pb";

interface RegionEditorLeftProps {
  image: string;
  regions: Region[];
  setRegions: (regions: Region[]) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
}

function getRegionRectangle(region: Region): Rectangle | null {
  const transformation = region.transformations[0]?.transformation;
  if (transformation.oneofKind !== "crop") {
    return null;
  }

  const crop = transformation.crop;
  if (crop.params.oneofKind !== "fixed") {
    return null;
  }

  const { x, y, width, height } = crop.params.fixed;
  return { x: x, y: y, width: width, height: height };
}

function getRegionRectangles(regions: Region[]): Rectangles {
  return Object.fromEntries(
    regions
      .map((region) => ({
        id: region.id,
        rectangle: getRegionRectangle(region),
      }))
      .filter(
        (value): value is { id: string; rectangle: Rectangle } =>
          value.rectangle !== null,
      )
      .map(({ id, rectangle }) => [id, rectangle]),
  );
}

function setRegionRectangles(
  rectangles: Rectangles,
  regions: Region[],
  setRegions: (regions: Region[]) => void,
) {
  const updatedRegions = regions.map((region) => {
    const rectangle = rectangles[region.id];
    if (rectangle === undefined || rectangle === getRegionRectangle(region)) {
      return region;
    } else {
      const transformations = region.transformations;
      transformations[0] = crop(rectangle);
      return {
        ...region,
        transformations,
      };
    }
  });
  const newRegions: Region[] = Object.entries(rectangles)
    .filter(([id]) => !regions.find((region) => region.id === id))
    .map(([id, rectangle]) => {
      return Region.create({ id: id, transformations: [crop(rectangle)] });
    });
  setRegions([...updatedRegions, ...newRegions]);
}

function RegionEditorLeft({
  image,
  regions,
  selectedRectangleId,
  setRegions,
  setSelectedRectangleId,
}: RegionEditorLeftProps) {
  const rectangles = getRegionRectangles(regions);
  const setRectangles = (rectangles: Rectangles) =>
    setRegionRectangles(rectangles, regions, setRegions);

  return (
    <Stack spacing={5}>
      <ImageLabeller
        image={image}
        rectangles={rectangles}
        setRectangles={setRectangles}
        selectedRectangleId={selectedRectangleId}
        setSelectedRectangleId={setSelectedRectangleId}
      />
      {selectedRectangleId && (
        <Typography variant="h4">
          Selected rectangle: {selectedRectangleId}
        </Typography>
      )}
    </Stack>
  );
}

interface TransformationResultProps {
  transformation?: string;
  result: TransformResult | null;
}

function TransformationResult({
  transformation,
  result,
}: TransformationResultProps) {
  return (
    <Stack spacing={1}>
      <Typography>{transformation}</Typography>
      {result?.result ? (
        <>
          <Box display={"flex"} width={100} height={100} alignItems={"center"}>
            {result.result instanceof Uint8Array ? (
              <img
                src={URL.createObjectURL(new Blob([result.result]))}
                className={styles.image}
              />
            ) : (
              <Typography maxHeight={1} width={1} overflow={"auto"}>
                {result.result}
              </Typography>
            )}
          </Box>
          <Typography>{`${result.elapsed.toFixed(3)}ms`}</Typography>
        </>
      ) : (
        <>
          <Skeleton width={100} height={100}></Skeleton>
          <Typography>Loading</Typography>
        </>
      )}
    </Stack>
  );
}

interface TransformResult {
  result: Uint8Array | string | null;
  elapsed: number;
}

interface RegionTransformationsProps {
  region: Region;
  onUpdateRegion: (region: Region) => void;
  onDeleteRegion: () => void;
  imageData: Uint8Array | null;
}

function RegionTransformations({
  region,
  onUpdateRegion,
  onDeleteRegion,
  imageData,
}: RegionTransformationsProps) {
  const transformClient = useGrpcClient(TransformServiceClient);
  const [transformResults, setTransformResults] = useState<TransformResult[]>(
    [],
  );
  const setTransformations = (transformations: TransformToImage[]) =>
    onUpdateRegion({ ...region, transformations });

  const { name, transformations } = region;

  useEffect(() => {
    async function transform(
      imageData: Uint8Array,
      client: TransformServiceClient,
      transformations: TransformToImage[],
    ) {
      const transform = client.transform({
        image: {
          blob: {
            data: imageData,
          },
        },
        imageTransformations: transformations,
        otherTransformation: ocr(),
      });

      for await (const { transformed, elapsed } of transform.responses) {
        if (transformed.oneofKind === "image") {
          const data = transformed.image.blob?.data;
          if (data) {
            const result: TransformResult = { result: data, elapsed: elapsed };
            setTransformResults((results) => [...results, result]);
          }
        } else if (transformed.oneofKind === "characters") {
          const result: TransformResult = {
            result: transformed.characters,
            elapsed: elapsed,
          };
          setTransformResults((results) => [...results, result]);
        }
      }
    }

    if (imageData && transformClient) {
      setTransformResults([]);
      transform(imageData, transformClient, transformations);
    }
  }, [imageData, transformClient, transformations]);

  return (
    <Stack border={1} borderRadius={1} padding={2} spacing={1}>
      <Stack
        direction={"row"}
        alignItems="center"
        justifyContent={"space-between"}
      >
        <Typography variant="body1" gutterBottom>
          {name}
        </Typography>
        <Stack direction={"row"}>
          <IconButton onClick={onDeleteRegion}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Divider />
      <Stack direction={"row"} justifyContent={"space-between"} spacing={2}>
        <TransformationResult
          transformation={transformations[0].transformation.oneofKind}
          result={transformResults.at(0) ?? null}
        />
        <Stack
          direction={"row"}
          spacing={2}
          overflow="auto"
          alignItems={"center"}
        >
          <AddTransformationButton
            setTransformation={(transformation) =>
              setTransformations([transformation, ...transformations])
            }
          />
          {transformations.slice(1).map((transformation, index) => (
            <Fragment key={index}>
              <TransformationResult
                transformation={transformation.transformation.oneofKind}
                result={transformResults.at(index + 1) ?? null}
              />
              <AddTransformationButton
                setTransformation={(transformation) => {
                  const splicedTransformations = transformations;
                  splicedTransformations.splice(index + 1, 0, transformation);
                  setTransformations([...splicedTransformations]);
                }}
              />
            </Fragment>
          ))}
        </Stack>
        <TransformationResult
          transformation="OCR"
          result={transformResults.at(-1) ?? null}
        />
      </Stack>
    </Stack>
  );
}

interface AddTransformationButtonProps {
  setTransformation: (transformation: TransformToImage) => void;
}

function AddTransformationButton({
  setTransformation,
}: AddTransformationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <Box>
      <IconButton size="small" onClick={open}>
        <AddCircleOutlineOutlinedIcon />
      </IconButton>
      <Dialog onClose={close} open={isOpen} fullWidth maxWidth="sm">
        <DialogTitle>Add a transformation</DialogTitle>
        <DialogContent>
          <ProtobufEditor
            message={TransformToImage.create()}
            setMessage={(transformation) => {
              setTransformation(transformation);
              close();
            }}
            onCancel={close}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

interface RegionEditorRightParams {
  image: string;
  regions: Region[];
  setRegions: (regions: Region[]) => void;
}

function RegionEditorRight({
  image,
  regions,
  setRegions,
}: RegionEditorRightParams) {
  const [imageData, setImageData] = useState<Uint8Array | null>(null);
  useEffect(() => {
    fetch(image)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer))
      .then(setImageData);
  }, [image]);

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
      {regions.map((region, index, regions) => (
        <RegionTransformations
          key={region.id}
          region={region}
          onUpdateRegion={(region) => {
            const updatedRegions = regions;
            updatedRegions[index] = region;
            setRegions([...updatedRegions]);
          }}
          onDeleteRegion={() => {
            const updatedRegions = regions;
            updatedRegions.splice(index, 1);
            setRegions([...updatedRegions]);
          }}
          imageData={imageData}
        />
      ))}
    </Stack>
  );
}

export default function RegionEditor() {
  const [regions, setRegions] = useLocalState<Region[]>([], "regions");
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(
    null,
  );
  const image = snapshotImage;
  return (
    <Box width={1} height={1} display="flex" justifyContent="center" p={10}>
      <Grid2 container width={1} spacing={10}>
        <Grid2 xs={12} lg={6}>
          <RegionEditorLeft
            image={image}
            regions={regions}
            setRegions={setRegions}
            selectedRectangleId={selectedRectangleId}
            setSelectedRectangleId={setSelectedRectangleId}
          />
        </Grid2>
        <Grid2 height={1} xs={12} lg={6}>
          <RegionEditorRight
            image={image}
            regions={regions}
            setRegions={setRegions}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
}

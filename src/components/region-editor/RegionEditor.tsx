import ImageLabeller from "../image-labeller/ImageLabeller.tsx";
import snapshotImage from "../../assets/snapshot.png";
import useLocalState from "../../hooks/UseLocalState.tsx";
import { Rectangle, Rectangles } from "../shapes/Rectangle.tsx";
import { Fragment, useEffect, useMemo, useState } from "react";
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
import {
  TransformToImage,
  TransformToOther,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb";
import { crop, ocr } from "./Transform.ts";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ProtobufEditor from "../protobuf-editor/ProtobufEditor.tsx";

interface RegionEditorLeftProps {
  image: string;
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
  selectedRectangleId: string | null;
  setSelectedRectangleId: (id: string | null) => void;
}

function RegionEditorLeft({
  image,
  rectangles,
  selectedRectangleId,
  setRectangles,
  setSelectedRectangleId,
}: RegionEditorLeftProps) {
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
  id: string;
  rectangle: Rectangle;
  onDeleteRectangle: () => void;
  imageData: Uint8Array | null;
}

function RegionTransformations({
  id,
  rectangle,
  onDeleteRectangle,
  imageData,
}: RegionTransformationsProps) {
  const transformClient = useGrpcClient(TransformServiceClient);
  const [transformResults, setTransformResults] = useState<TransformResult[]>(
    [],
  );

  const firstTransformation = useMemo(() => crop(rectangle), [rectangle]);
  const lastTransformation = useMemo(() => ocr(), []);
  const [transformations, setTransformations] = useState<TransformToImage[]>(
    [],
  );

  useEffect(() => {
    async function transform(
      imageData: Uint8Array,
      client: TransformServiceClient,
      firstTransformation: TransformToImage,
      lastTransformation: TransformToOther,
      transformations: TransformToImage[],
    ) {
      const transform = client.transform({
        image: {
          blob: {
            data: imageData,
          },
        },
        imageTransformations: [firstTransformation, ...transformations],
        otherTransformation: lastTransformation,
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
      transform(
        imageData,
        transformClient,
        firstTransformation,
        lastTransformation,
        transformations,
      );
    }
  }, [
    imageData,
    transformClient,
    firstTransformation,
    lastTransformation,
    transformations,
  ]);

  return (
    <Stack border={1} borderRadius={1} padding={2} spacing={1}>
      <Stack
        direction={"row"}
        alignItems="center"
        justifyContent={"space-between"}
      >
        <Typography variant="body1" gutterBottom>
          {id}
        </Typography>
        <Stack direction={"row"}>
          <IconButton onClick={onDeleteRectangle}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Divider />
      <Stack direction={"row"} justifyContent={"space-between"} spacing={2}>
        <TransformationResult
          transformation={firstTransformation.transformation.oneofKind}
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
          {transformations.map((transformation, index) => (
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
          transformation={lastTransformation.transformation.oneofKind}
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
  rectangles: Rectangles;
  setRectangles: (rectangles: Rectangles) => void;
}

function RegionEditorRight({
  image,
  rectangles,
  setRectangles,
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
      {Object.entries(rectangles).map(([id, rectangle]) => (
        <RegionTransformations
          key={id}
          id={id}
          rectangle={rectangle}
          onDeleteRectangle={() => {
            setRectangles(
              Object.fromEntries(
                Object.entries(rectangles).filter(([rectId]) => rectId !== id),
              ),
            );
          }}
          imageData={imageData}
        />
      ))}
    </Stack>
  );
}

export default function RegionEditor() {
  const [rectangles, setRectangles] = useLocalState<Rectangles>({}, "regions");
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
            rectangles={rectangles}
            setRectangles={setRectangles}
            selectedRectangleId={selectedRectangleId}
            setSelectedRectangleId={setSelectedRectangleId}
          />
        </Grid2>
        <Grid2 height={1} xs={12} lg={6}>
          <RegionEditorRight
            image={image}
            rectangles={rectangles}
            setRectangles={setRectangles}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
}

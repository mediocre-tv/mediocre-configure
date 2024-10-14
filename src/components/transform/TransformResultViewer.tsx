import { Alert, Stack, Typography } from "@mui/material";
import { SkeletonBox } from "../skeleton/SkeletonBox.tsx";
import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { Fragment } from "react";
import { TransformResultOrError } from "../providers/transform-results/TransformResults.ts";

interface TransformResultProps {
  result: TransformResultOrError | undefined;
}

export function TransformResult({ result }: TransformResultProps) {
  return (
    <SkeletonBox
      showSkeleton={!result}
      width={200}
      height={200}
      boxProps={{ padding: 1 }}
    >
      {result &&
        ("error" in result ? (
          <Alert severity={"error"}>{result.error}</Alert>
        ) : "image" in result ? (
          <img
            src={result.image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        ) : (
          <Typography>{result.text}</Typography>
        ))}
    </SkeletonBox>
  );
}

interface TransformResultViewerProps {
  label?: string;
  results: TransformResultOrError[];
  onClick?: () => void;
}

export function TransformResultViewer({
  label,
  results,
  onClick,
}: TransformResultViewerProps) {
  const result =
    results.find((result) => "error" in result) ??
    results.at(results.length - 1);

  return (
    <Stack margin={1} width={200} onClick={onClick} sx={{ cursor: "pointer" }}>
      <TransformResult result={result} />
      {label && (
        <Typography textAlign={"center"} paddingBottom={1}>
          {label}
        </Typography>
      )}
    </Stack>
  );
}

interface TransformResultsViewerProps {
  image: string;
  transforms: Transform[];
  setTransforms: (transformations: Transform[]) => void;
  results: TransformResultOrError[];
}

export function TransformResultsViewer({
  image,
  results,
  transforms,
  setTransforms,
}: TransformResultsViewerProps) {
  const addTransformation = (transformation: Transform, index: number) =>
    setTransforms(transforms.toSpliced(index + 1, 0, transformation));

  const setTransformation = (transformation: Transform, index: number) =>
    setTransforms(transforms.toSpliced(index, 1, transformation));

  return (
    <Stack
      direction={"row"}
      spacing={2}
      justifyContent={"space-between"}
      alignItems={"center"}
      overflow="auto"
    >
      {transforms.map((transformation, index) => {
        const result = results[index];
        const previousResult =
          index == 0 ? { result: image, elapsed: 0 } : results[index - 1];

        return (
          <Fragment key={index}>
            <TransformResult result={result} />
            {/*<EditableTransformationResult*/}
            {/*  transformation={transformation}*/}
            {/*  result={result}*/}
            {/*  previousResult={previousResult}*/}
            {/*  setTransformation={(transformation) =>*/}
            {/*    setTransformation(transformation, index)*/}
            {/*  }*/}
            {/*/>*/}
            {/*{index < transformations.length - 1 && (*/}
            {/*  <AddTransformationButton*/}
            {/*    addTransformation={(transformation) =>*/}
            {/*      addTransformation(transformation, index)*/}
            {/*    }*/}
            {/*    previousResult={result}*/}
            {/*  />*/}
            {/*)}*/}
          </Fragment>
        );
      })}
    </Stack>
  );
}

// function RegionTransformationsBody({
//   imageData,
//   transformations,
//   setTransformations,
//   results,
// }: RegionTransformationsBodyProps) {

// }

// function TransformationResult({ label, result }: TransformationResultProps) {
//   const imgRef = useRef<HTMLImageElement>(null);
//   const [imageDimensions, setImageDimensions] = useState<Dimensions | null>(
//     null,
//   );
//
//   const timeTaken =
//     result?.elapsed !== null && result?.elapsed !== undefined
//       ? result.elapsed.toFixed(3)
//       : "unknown ";
//
//   const footerText = imageDimensions
//     ? `${imageDimensions.width} x ${imageDimensions.height}`
//     : "Text";
//
//   const imageOrText = result && result.result !== null && (
//     <Box display={"flex"} width={100} height={100} alignItems={"center"}>
//       {result.result instanceof Uint8Array ? (
//         <img
//           ref={imgRef}
//           src={URL.createObjectURL(new Blob([result.result]))}
//           className={styles.image}
//           onLoad={() => {
//             if (imgRef.current) {
//               const newDimensions = {
//                 width: imgRef.current.naturalWidth,
//                 height: imgRef.current.naturalHeight,
//               };
//               if (
//                 imageDimensions?.width !== newDimensions.width &&
//                 imageDimensions?.height !== newDimensions.height
//               ) {
//                 setImageDimensions(newDimensions);
//               }
//             }
//           }}
//         />
//       ) : (
//         <Typography
//           maxHeight={1}
//           width={1}
//           overflow={"auto"}
//           component="div"
//           align={"center"}
//         >
//           {result.result !== "" ? (
//             result.result
//           ) : (
//             <Box sx={{ fontStyle: "italic" }}>Empty</Box>
//           )}
//         </Typography>
//       )}
//     </Box>
//   );
//
//   return (
//     <Stack spacing={1}>
//       <Typography align={"center"}>{label}</Typography>
//       {result && result.result !== null ? (
//         <>
//           {imageOrText}
//           <Typography align={"center"}>{footerText}</Typography>
//           <Typography align={"center"}>{timeTaken}ms</Typography>
//         </>
//       ) : (
//         <>
//           <Skeleton width={100} height={100}></Skeleton>
//           <Typography align={"center"}>Loading</Typography>
//         </>
//       )}
//     </Stack>
//   );
// }
//
// interface EditableTransformationResultProps {
//   transformation: Transform;
//   setTransformation: (transformation: Transform) => void;
//   result: TransformResult | null;
//   previousResult: TransformResult | null;
// }
//
// function EditableTransformationResult({
//   transformation,
//   setTransformation,
//   result,
//   previousResult,
// }: EditableTransformationResultProps) {
//   const [isEditing, setIsEditing] = useState(false);
//   let label: string | undefined;
//   if (transformation.transformation.oneofKind === "imageToImage") {
//     label = transformation.transformation.imageToImage.transformation.oneofKind;
//   } else if (transformation.transformation.oneofKind === "imageToText") {
//     label = transformation.transformation.imageToText.transformation.oneofKind;
//   }
//
//   return (
//     <>
//       <IconButton onClick={() => setIsEditing(true)} sx={{ borderRadius: 2 }}>
//         <TransformationResult label={label ?? "Unknown"} result={result} />
//       </IconButton>
//       <EditTransformationDialog
//         transformation={transformation}
//         setTransformation={setTransformation}
//         isOpen={isEditing}
//         onClose={() => setIsEditing(false)}
//         previousResult={previousResult}
//       />
//     </>
//   );
// }
//
// interface RegionTransformationsBodyProps {
//   imageData: Uint8Array | null;
//   transformations: Transform[];
//   setTransformations: (transformations: Transform[]) => void;
//   results: TransformResult[];
// }
//

//
// interface AddTransformationButtonProps {
//   addTransformation: (transformation: Transform) => void;
//   previousResult: TransformResult | null;
// }
//
// function AddTransformationButton({
//   addTransformation,
//   previousResult,
// }: AddTransformationButtonProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const open = () => setIsOpen(true);
//   const close = () => setIsOpen(false);
//
//   return (
//     <Box>
//       <IconButton size="small" onClick={open}>
//         <AddCircleOutlineOutlinedIcon />
//       </IconButton>
//       <EditTransformationDialog
//         transformation={Transform.create()}
//         setTransformation={addTransformation}
//         isOpen={isOpen}
//         onClose={close}
//         previousResult={previousResult}
//       />
//     </Box>
//   );
// }
//

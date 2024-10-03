import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { Rectangle } from "../shapes/Rectangle";
import { isRpcError } from "../grpc/GrpcHealth.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb.client";

export function crop(rectangle: Rectangle): Transform {
  return {
    transformation: {
      oneofKind: "imageToImage",
      imageToImage: {
        transformation: {
          oneofKind: "crop",
          crop: {
            params: {
              oneofKind: "fixed",
              fixed: rectangle,
            },
          },
        },
      },
    },
  };
}

export function tesseract(): Transform {
  return {
    transformation: {
      oneofKind: "imageToText",
      imageToText: {
        transformation: {
          oneofKind: "getCharacters",
          getCharacters: {
            params: {
              oneofKind: "tesseractParams",
              tesseractParams: {},
            },
          },
        },
      },
    },
  };
}

export interface TransformResult {
  result: Uint8Array | string | null;
  elapsed: number | null;
}

export async function transform(
  imageData: Uint8Array,
  client: TransformServiceClient,
  transformations: Transform[],
  abortController?: AbortController,
) {
  const transform = client.transform(
    {
      image: {
        blob: {
          data: imageData,
        },
      },
      transformations: transformations,
    },
    { abort: abortController?.signal },
  );

  const results: TransformResult[] = [];

  try {
    for await (const { transformed, elapsed } of transform.responses) {
      if (!transformed) {
        results.push({ result: "No transformed value set", elapsed: null });
        return results;
      }
      if (transformed.value.oneofKind === "image") {
        const data = transformed.value.image.blob?.data;
        if (data) {
          results.push({ result: data, elapsed: elapsed });
        }
      } else if (transformed.value.oneofKind === "characters") {
        results.push({
          result: transformed.value.characters,
          elapsed: elapsed,
        });
      }
    }
  } catch (error) {
    let errorMessage;
    if (isRpcError(error)) {
      errorMessage = error.message || error.code;
    } else {
      errorMessage = "Unknown error";
    }
    results.push({ result: errorMessage, elapsed: null });
  }

  return results;
}

export async function transformSingle(
  imageData: Uint8Array,
  client: TransformServiceClient,
  transformations: Transform,
  abortController?: AbortController,
) {
  return (
    await transform(imageData, client, [transformations], abortController)
  )[0];
}

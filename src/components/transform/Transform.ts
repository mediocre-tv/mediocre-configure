import {
  Transform,
  TransformImageToImage,
  TransformRequest,
  TransformResponse,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb";
import { Rectangle } from "../shapes/Rectangle";
import { isRpcError } from "../providers/grpc/GrpcHealth.ts";
import { TransformServiceClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/transform/v1beta/transform_pb.client";
import { TransformResultOrError } from "../providers/transform-results/TransformResults.ts";

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

export interface ImageToImageTransform {
  transformation: {
    oneofKind: "imageToImage";
    imageToImage: TransformImageToImage;
  };
}

export function isImageToImageTransform(
  transform: Transform,
): transform is ImageToImageTransform {
  return transform.transformation.oneofKind === "imageToImage";
}

export async function transform(
  image: string,
  transforms: Transform[],
  client: TransformServiceClient,
  abortController?: AbortController,
) {
  const imageData = await fetch(image)
    .then((res) => res.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  const request: TransformRequest = {
    image: {
      blob: {
        data: imageData,
      },
    },
    transformations: transforms,
  };

  const transformed = client.transform(request, {
    abort: abortController?.signal,
  });

  try {
    const results: TransformResultOrError[] = [];
    for await (const timedResponse of transformed.responses) {
      const result = getResultFromResponse(timedResponse);
      results.push(result);
    }
    await transformed.status;
    await transformed.trailers;
    return results;
  } catch (error) {
    let errorMessage;
    if (isRpcError(error)) {
      errorMessage = error.message || error.code;
    } else {
      errorMessage = "Unknown error";
    }
    throw new Error(errorMessage);
  }
}

export async function transformSingle(
  image: string,
  singleTransform: Transform,
  client: TransformServiceClient,
  abortController?: AbortController,
) {
  const results = await transform(
    image,
    [singleTransform],
    client,
    abortController,
  );
  return results[0];
}

function getResultFromResponse(
  timedResponse: TransformResponse,
): TransformResultOrError {
  const response = timedResponse.response;
  if (response.oneofKind === "error") {
    return { error: response.error, elapsed: timedResponse.elapsed };
  }

  if (response.oneofKind === "transformed") {
    const transformed = response.transformed;
    switch (transformed.value.oneofKind) {
      case "image": {
        const data = transformed.value.image.blob?.data;
        if (data) {
          return {
            image: URL.createObjectURL(new Blob([data])),
            elapsed: timedResponse.elapsed,
          };
        } else {
          return { error: "No data in image", elapsed: timedResponse.elapsed };
        }
      }
      case "characters": {
        return {
          text: transformed.value.characters,
          elapsed: timedResponse.elapsed,
        };
      }
    }
  }

  return { error: "Unknown response", elapsed: timedResponse.elapsed };
}

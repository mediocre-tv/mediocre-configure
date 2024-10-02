import { Transform } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb";
import { Rectangle } from "../shapes/Rectangle";

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

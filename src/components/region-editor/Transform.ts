import {
  TransformToImage,
  TransformToOther,
} from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/mediocre/image/transform/v1beta/transform_pb";
import { Rectangle } from "../shapes/Rectangle";

export function crop(rectangle: Rectangle): TransformToImage {
  return {
    transformation: {
      oneofKind: "crop",
      crop: {
        params: {
          oneofKind: "fixed",
          fixed: rectangle,
        },
      },
    },
  };
}

export function ocr(): TransformToOther {
  return {
    transformation: {
      oneofKind: "getCharacters",
      getCharacters: {},
    },
  };
}

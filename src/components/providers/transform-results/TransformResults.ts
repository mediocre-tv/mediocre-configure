export interface TransformError {
  error: string;
  elapsed: number;
}

export interface TransformImageResult {
  image: string;
  elapsed: number;
}

export interface TransformTextResult {
  text: string;
  elapsed: number;
}

export type TransformResultOrError =
  | TransformError
  | TransformImageResult
  | TransformTextResult;

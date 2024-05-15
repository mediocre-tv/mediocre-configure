import { getTransport, GrpcContextProps } from "./GrpcContext.ts";
import { HealthClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/grpc/health/v1/health_pb.client";
import { HealthCheckResponse_ServingStatus } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/grpc/health/v1/health_pb";
import { RpcError } from "@protobuf-ts/runtime-rpc/build/types/rpc-error";

export function isRpcError(error: unknown): error is RpcError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as Record<string, unknown>).name === "RpcError"
  );
}

export function isErrorWithMessage(error: unknown): error is Error {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string" &&
    error.message !== ""
  );
}

export async function checkHealth(context: GrpcContextProps) {
  const transport = getTransport(context);
  const client = new HealthClient(transport);

  try {
    const { response } = await client.check({ service: "" });
    if (response.status === HealthCheckResponse_ServingStatus.SERVING) {
      return {
        isValid: true,
        errorMessage: null,
      };
    } else {
      return {
        isValid: false,
        errorMessage: `GRPC Service Status: ${response.status}`,
      };
    }
  } catch (error) {
    let errorMessage;
    if (isRpcError(error)) {
      errorMessage = error.message || error.code;
    } else if (isErrorWithMessage(error)) {
      errorMessage = error.message;
    } else {
      errorMessage = "Unknown error";
    }
    return {
      isValid: false,
      errorMessage: errorMessage,
    };
  }
}

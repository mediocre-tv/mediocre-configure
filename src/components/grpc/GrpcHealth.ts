import { GrpcContextProps } from "./GrpcContext.tsx";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { HealthClient } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/grpc/health/v1/health_pb.client";
import { HealthCheckResponse_ServingStatus } from "@buf/broomy_mediocre.community_timostamm-protobuf-ts/grpc/health/v1/health_pb";

export function isErrorWithMessage(error: unknown): error is Error {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

export async function checkHealth(context: GrpcContextProps) {
  const transport = new GrpcWebFetchTransport({
    baseUrl: context.baseUrl,
  });
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
    if (isErrorWithMessage(error)) {
      errorMessage = `${error.name}: ${error.message}`;
    } else {
      errorMessage = "Unknown error";
    }
    return {
      isValid: false,
      errorMessage: errorMessage,
    };
  }
}

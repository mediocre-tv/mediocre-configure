import { PropsWithChildren, useState } from "react";
import useValidateGrpcTransport from "./useValidateGrpcTransport.ts";
import GrpcConfigDialog from "./GrpcConfigDialog.tsx";
import GrpcProvider from "./GrpcProvider.tsx";
import { getTransport } from "./GrpcContext.ts";

export interface GrpcTransportParts {
  domain: string;
  port: string;
}

const defaultParts: GrpcTransportParts = {
  domain: import.meta.env.VITE_CLIENT_DOMAIN,
  port:
    location.protocol === "https:"
      ? import.meta.env.VITE_CLIENT_HTTPS_PORT
      : import.meta.env.VITE_CLIENT_HTTP_PORT,
};

export default function GrpcProviderWithDialog({
  children,
}: PropsWithChildren) {
  const { validating: defaultPartsValidating, valid: defaultPartsValid } =
    useValidateGrpcTransport(defaultParts);
  const [customParts, setCustomParts] = useState<GrpcTransportParts | null>(
    null,
  );

  const transportParts =
    customParts ?? (defaultPartsValid ? defaultParts : null);

  const context = transportParts
    ? { transport: getTransport(transportParts) }
    : null;

  return (
    <>
      <GrpcConfigDialog
        open={!defaultPartsValidating && !context}
        parts={transportParts}
        setParts={setCustomParts}
      />
      <GrpcProvider context={context}>{children}</GrpcProvider>
    </>
  );
}

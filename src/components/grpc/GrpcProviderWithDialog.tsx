import { PropsWithChildren, useState } from "react";
import { GrpcContextProps } from "./GrpcContext.ts";
import useValidateGrpcContext from "./useValidateGrpcContext.ts";
import GrpcConfigDialog from "./GrpcConfigDialog.tsx";
import GrpcProvider from "./GrpcProvider.tsx";

const defaultContext: GrpcContextProps = {
  domain: import.meta.env.VITE_CLIENT_DOMAIN,
  port:
    location.protocol === "https:"
      ? import.meta.env.VITE_CLIENT_HTTPS_PORT
      : import.meta.env.VITE_CLIENT_HTTP_PORT,
};

export default function GrpcProviderWithDialog({
  children,
}: PropsWithChildren) {
  const { validating: defaultContextValidating, valid: defaultContextValid } =
    useValidateGrpcContext(defaultContext);
  const [customContext, setCustomContext] = useState<GrpcContextProps | null>(
    null,
  );

  const context =
    customContext ?? (defaultContextValid ? defaultContext : null);

  return (
    <>
      <GrpcConfigDialog
        open={!defaultContextValidating && !context}
        context={context}
        setContext={setCustomContext}
      />
      <GrpcProvider context={context}>{children}</GrpcProvider>
    </>
  );
}

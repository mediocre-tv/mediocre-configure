/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_DOMAIN: string;
  readonly VITE_CLIENT_HTTP_PORT: string;
  readonly VITE_CLIENT_HTTPS_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

function developmentConfig() {
  let https;
  try {
    https = {
      key: fs.readFileSync("./.certs/localhost/key.pem"),
      cert: fs.readFileSync("./.certs/localhost/cert.pem"),
    };
  } catch (error) {
    console.error(
      "Could not load TLS certificates, falling back to HTTP.\n",
      error,
    );
  }

  return {
    server: {
      https,
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  ...(mode === "development" && developmentConfig()),
  plugins: [react()],
}));

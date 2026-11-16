import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root,
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        services: resolve(root, "services.html"),
        serviceArea: resolve(root, "service-area.html"),
        about: resolve(root, "about.html"),
        contact: resolve(root, "contact.html"),
      },
    },
  },
});

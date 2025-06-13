import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/main.js",
      name: "DeepLTranslateAPI",
      fileName: "deepl-translate-api",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["playwright", "child_process", "fs", "path", "readline"],
      output: {
        globals: {
          playwright: "playwright",
          child_process: "child_process",
          fs: "fs",
          path: "path",
          readline: "readline",
        },
      },
    },
    target: "node14",
  },
});

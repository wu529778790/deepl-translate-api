import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/main.js",
      name: "DeepLTranslateAPI",
      fileName: "deepl-translate-api",
    },
    rollupOptions: {
      external: ["playwright"],
      output: {
        globals: {
          playwright: "playwright",
        },
      },
    },
  },
});

import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "zh",
  locales: ["zh", "ko", "en"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["<rootDir>/src", "../../packages/utils/src"],
      exclude: ["**/node_modules/**"],
    },
  ],
});

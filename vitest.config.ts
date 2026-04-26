import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "cli/**/test/**/*.test.ts",
      "cli/agent-mem/templates/stacks/**/test/**/*.test.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "cli/agent-mem/templates/stacks/playwright-ts/**",
    ],
  },
});

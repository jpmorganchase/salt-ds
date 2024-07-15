import path from "node:path";
import { getTsconfig } from "get-tsconfig";

export function distinct(arr) {
  return [...new Set(arr)];
}

export async function getTypescriptConfig(cwd) {
  const typescriptConfig = {};

  const result = getTsconfig(cwd);

  Object.assign(typescriptConfig, result.config, {
    include: [path.join(cwd, "src")],
    exclude: distinct(
      [
        // all TS test files, regardless whether co-located or in test/ etc
        "**/*.stories.ts",
        "**/*.stories.tsx",
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/*.e2e.ts",
        "**/*.spec.tsx",
        "**/*.test.tsx",
        "**/__tests__",
        "**/dist-cjs",
        "**/dist-es",
        "**/dist-types",
        // TS defaults below
        "node_modules",
        "bower_components",
        "jspm_packages",
        "tmp",
      ].concat(result.exclude ?? []),
    ),
  });

  return typescriptConfig;
}

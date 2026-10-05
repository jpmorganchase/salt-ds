import path from "node:path";
import { fileURLToPath } from "node:url";

// Dependencies other than the packed Salt packages are resolved from the
// repo's node_modules.
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export default {
  outputFileTracingRoot: repoRoot,
  turbopack: { root: repoRoot },
};

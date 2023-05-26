import type { Plugin } from "vite";
import { createFilter } from "vite";

export interface Options {
  /** Glob patterns to ignore */
  exclude?: string[];
  /** Glob patterns to include. defaults to ts|tsx */
  include?: string[];
}

// This plugin adds "?inline" to each css import within our components to disable
// vite's own style injection used in storybook
export function cssInline(options: Options = {}): Plugin {
  const {
    exclude = ["**/**.stories.tsx"],
    include = ["**/packages/**/*.tsx"],
  } = options;
  const filter = createFilter(include, exclude);

  return {
    name: "css-inline-plugin",
    enforce: "pre",
    async resolveId(id, importer) {
      if (filter(importer)) {
        if (id.endsWith(".css")) {
          return this.resolve(id + "?inline", importer);
        }
      }
    },
  };
}

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import browserslist from "browserslist";
import { browserslistToTargets, transform } from "lightningcss";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

// The production browserslist in the root package.json is the baseline Salt supports.
const targets = browserslistToTargets(
  browserslist(undefined, { path: rootDir, env: "production" }),
);

// Lightning CSS can lower these properties only by guessing the text direction from the element's
// language, which breaks layouts whose direction comes from `dir`. Keep them as authored instead.
const directionalProperty =
  /(?<=[{;\s])(inset-inline(?:-start|-end)?|border-(?:start|end)-(?:start|end)-radius)(?=\s*:)/g;
const keepPrefix = "--salt-css-baseline-keep-";

/**
 * Lowers modern CSS to the browsers in the root browserslist's production environment.
 *
 * @param {string} code
 * @param {string} filename
 * @returns {string}
 */
export function transformCss(code, filename) {
  const result = transform({
    filename,
    code: Buffer.from(code.replace(directionalProperty, `${keepPrefix}$1`)),
    targets,
  })
    .code.toString()
    .replaceAll(keepPrefix, "");

  if (result.includes(":lang(ae)")) {
    throw new Error(
      `${filename}: lowering this CSS guessed text direction from :lang(). Add the property responsible to directionalProperty in scripts/cssBaseline.mjs.`,
    );
  }

  return result;
}

/**
 * Lowers a CSS file in place, or into `to`.
 *
 * @param {string} from
 * @param {string} [to]
 */
export async function transformCssFile(from, to = from) {
  await writeFile(to, transformCss(await readFile(from, "utf8"), from));
}

/**
 * PostCSS plugin that lowers the whole stylesheet once any `@import`s have been inlined. Used by
 * rollup-plugin-postcss for component CSS, and by Vite so that Storybook and the browser tests
 * render the CSS that Salt publishes.
 *
 * @returns {import("postcss").Plugin}
 */
export function postcssCssBaseline() {
  return {
    postcssPlugin: "salt-css-baseline",
    OnceExit(root, { postcss }) {
      const filename = root.source?.input.file ?? "unknown.css";
      if (filename.includes("/node_modules/")) return;
      const lowered = postcss.parse(transformCss(root.toString(), filename), {
        from: filename,
      });
      root.removeAll();
      root.append(lowered.nodes);
    },
  };
}
postcssCssBaseline.postcss = true;

/**
 * esbuild plugin that lowers each CSS file as it is loaded into a bundle.
 *
 * @returns {import("esbuild").Plugin}
 */
export function esbuildCssBaseline() {
  return {
    name: "salt-css-baseline",
    setup(build) {
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        if (args.path.includes("/node_modules/")) return undefined;
        return {
          contents: transformCss(await readFile(args.path, "utf8"), args.path),
          loader: "css",
        };
      });
    },
  };
}

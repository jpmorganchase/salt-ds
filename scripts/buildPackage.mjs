import { readFile } from "node:fs/promises";
import path from "node:path";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { getTsconfig } from "get-tsconfig";
import { rolldown } from "rolldown";
import { makeTypings } from "./makeTypings.mjs";
import { emptyDir } from "./utils.mjs";
import { writeBundle } from "./writeBundle.mjs";

function createBuildOptions(cwd, input) {
  return {
    cwd,
    input: path.resolve(cwd, input),
    tsconfig: getTsconfig(cwd)?.path,
    // Published libraries must leave development checks for the consumer's build.
    platform: "neutral",
    external: (id) => !id.startsWith(".") && !path.isAbsolute(id),
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      mainFields: ["module", "main", "browser"],
    },
    transform: {
      target: browserslistToEsbuild(undefined, {
        path: cwd,
        env: "production",
      }),
      jsx: { development: false },
    },
    // Salt owns injection, including CSP nonces and the destination window.
    moduleTypes: { ".css": "text" },
    treeshake: { propertyReadSideEffects: false },
  };
}

async function buildJavaScript(cwd, entries) {
  for (const { input, directory = "", preserveModules = true } of entries) {
    const bundle = await rolldown(createBuildOptions(cwd, input));
    try {
      for (const [format, outputDirectory] of [
        ["cjs", "dist-cjs"],
        ["es", "dist-es"],
      ]) {
        const outputPath = path.join(cwd, outputDirectory, directory);
        const { output } = await bundle.generate({
          dir: outputPath,
          format,
          // CSS and a component commonly share a basename (Button.css/Button.tsx).
          // Keep the asset suffix so it cannot take the component's published path.
          entryFileNames: (chunk) => {
            const extension = path.extname(chunk.facadeModuleId ?? "");
            return preserveModules && [".css", ".json"].includes(extension)
              ? `[name]${extension}.js`
              : "[name].js";
          },
          preserveModules,
          preserveModulesRoot: path.join(cwd, "src"),
          exports: preserveModules ? "auto" : "named",
          sourcemap: true,
        });
        // Rolldown also returns source maps as assets. Write the generated
        // bytes unchanged, using bounded parallel I/O for preserved modules.
        await writeBundle(outputPath, output);
      }
    } finally {
      await bundle.close();
    }
  }
}

async function preparePackage(cwd) {
  const results = await Promise.allSettled(
    ["dist-cjs", "dist-es", "dist-types"].map((directory) =>
      emptyDir(path.join(cwd, directory)),
    ),
  );
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length > 0) {
    throw new AggregateError(failures, `Could not clean ${cwd}`);
  }
}

export async function buildPackage({
  cwd = process.cwd(),
  entries = [{ input: "src/index.ts" }],
} = {}) {
  const { name } = JSON.parse(
    await readFile(path.join(cwd, "package.json"), "utf8"),
  );
  console.log(`Building ${name}`);

  await preparePackage(cwd);

  // The native compiler runs in a separate process alongside JS generation.
  // Wait for both branches to finish, including cleanup, before reporting errors.
  const results = await Promise.allSettled([
    makeTypings(cwd),
    buildJavaScript(cwd, entries),
  ]);
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length > 0) {
    throw new AggregateError(failures, `Could not build ${name}`);
  }

  console.log(`Built ${name} into ${cwd}`);
}

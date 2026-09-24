#!/usr/bin/env node
// Runs the TypeScript sources directly with Node's type stripping. The resolve hook lets
// the sources keep the repository's extensionless relative imports, which root `tsgo`
// typechecks as-is (explicit `.ts` extensions would need allowImportingTsExtensions).
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

const HAS_EXTENSION = /\.[cm]?[jt]sx?$|\.json$/;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith(".") &&
      !HAS_EXTENSION.test(specifier) &&
      context.parentURL?.endsWith(".ts")
    ) {
      for (const suffix of [".ts", "/index.ts"]) {
        const candidate = new URL(`${specifier}${suffix}`, context.parentURL);
        if (existsSync(fileURLToPath(candidate))) {
          return nextResolve(candidate.href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

const { main } = await import("../src/cli.ts");
await main(process.argv.slice(2));

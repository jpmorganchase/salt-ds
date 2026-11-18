import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getTsconfig } from "get-tsconfig";
import { runTypeScript } from "./typescript.mjs";
import { getTypescriptConfig } from "./utils.mjs";

export async function makeTypings(packageDir) {
  const cwd = path.resolve(packageDir);
  // The generated configuration is written to the package directory, so the
  // resolved tsconfig must live there for its relative options to stay valid.
  const tsconfigPath = getTsconfig(cwd)?.path;
  if (!tsconfigPath || path.relative(cwd, path.dirname(tsconfigPath)) !== "") {
    throw new Error(`${cwd} must have its own tsconfig.json`);
  }
  const srcDir = path.join(cwd, "src");
  const typescriptConfig = await getTypescriptConfig(cwd, srcDir);
  const config = {
    ...typescriptConfig,
    include: [srcDir],
    compilerOptions: {
      ...typescriptConfig.compilerOptions,
      noCheck: false,
      noEmit: false,
      noEmitOnError: true,
      declaration: true,
      emitDeclarationOnly: true,
      declarationDir: path.join(cwd, "dist-types"),
      rootDir: srcDir,
    },
  };

  const configPath = path.join(cwd, `.salt-types-${randomUUID()}.json`);
  await writeFile(configPath, JSON.stringify(config), { flag: "wx" });

  console.log("generating .d.ts files");

  try {
    const exitCode = await runTypeScript(
      ["--project", configPath, "--pretty", "false"],
      { cwd },
    );
    if (exitCode !== 0) {
      throw new Error(`Could not generate declarations for ${cwd}`);
    }
  } finally {
    await rm(configPath, { force: true });
  }
}

import { randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { runTypeScript } from "./typescript.mjs";
import { getTypescriptConfig } from "./utils.mjs";

export async function makeTypings(packageDir) {
  const cwd = path.resolve(packageDir);
  const srcDir = path.join(cwd, "src");
  const typescriptConfig = await getTypescriptConfig(cwd, srcDir);
  const config = {
    ...typescriptConfig,
    include: [srcDir],
    compilerOptions: {
      ...typescriptConfig.compilerOptions,
      noEmit: false,
      noEmitOnError: true,
      declaration: true,
      emitDeclarationOnly: true,
      declarationDir: path.join(cwd, "dist-types"),
      rootDir: srcDir,
    },
  };

  // Keep relative compiler options anchored to the package's tsconfig directory.
  const configPath = path.join(cwd, `.salt-types-${randomUUID()}.json`);
  await writeFile(configPath, JSON.stringify(config), { flag: "wx" });

  console.log("generating .d.ts files");

  try {
    await runTypeScript(["--project", configPath, "--pretty", "false"], {
      cwd,
    });
  } finally {
    await rm(configPath, { force: true });
  }
}

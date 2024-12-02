import path from "node:path";
import { isCI } from "ci-info";
import fse from "fs-extra";
import { getTsconfig } from "get-tsconfig";
import ts from "typescript";

const typescriptConfigFilename = "tsconfig.json";
const cwd = process.cwd();

export function reportTSDiagnostics(diagnostics) {
  for (const diagnostic of diagnostics) {
    let message = "Error";
    if (diagnostic.file) {
      const where = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start,
      );
      message += ` ${diagnostic.file.fileName} ${where.line}, ${
        where.character + 1
      }`;
    }
    message += `: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
    console.error(message);
  }
}

export async function makeTypings(outDir, entryFolder) {
  const typescriptConfig = await getTypescriptConfig(cwd, entryFolder);

  console.log("generating .d.ts files");

  // make a shallow copy of the configuration
  const tsconfig = {
    ...typescriptConfig,
    compilerOptions: {
      ...typescriptConfig.compilerOptions,
    },
  };

  // then add our custom stuff
  // Only include src files from the package to prevent already built
  // files from interferring with the compile
  tsconfig.include = [path.join(cwd, "src", entryFolder)];
  tsconfig.compilerOptions = {
    ...tsconfig.compilerOptions,
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    declarationDir: path.join(outDir, "dist-types"),
    rootDir: path.join(cwd, "src"),
    diagnostics: !isCI,
  };

  // Extract config information
  const configParseResult = ts.parseJsonConfigFileContent(
    tsconfig,
    ts.sys,
    path.dirname(typescriptConfigFilename),
  );

  if (configParseResult.errors.length > 0) {
    reportTSDiagnostics(configParseResult.errors);
    throw new Error("Could not parse Typescript configuration");
  }

  const host = ts.createCompilerHost(configParseResult.options);
  host.writeFile = (fileName, contents) => {
    fse.mkdirpSync(path.dirname(fileName));
    fse.writeFileSync(fileName, contents);
  };

  // Compile
  const program = ts.createProgram(
    configParseResult.fileNames,
    configParseResult.options,
    host,
  );

  const emitResult = program.emit();

  // Skip diagnostic reporting in CI
  if (isCI) {
    return;
  }
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);
  if (diagnostics.length > 0) {
    reportTSDiagnostics(diagnostics);
    throw new Error("Could not generate .d.ts files");
  }
}

export function distinct(arr) {
  return [...new Set(arr)];
}

export async function getTypescriptConfig(cwd, entryFolder) {
  const typescriptConfig = {};

  const result = getTsconfig(cwd);

  Object.assign(typescriptConfig, result.config, {
    include: [path.join(cwd, "src", entryFolder)],
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

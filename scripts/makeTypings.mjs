import path from "node:path";
import { isCI } from "ci-info";
import fse from "fs-extra";
import ts from "typescript";

import { getTypescriptConfig } from "./utils.mjs";

const typescriptConfigFilename = "tsconfig.json";
const cwd = process.cwd();
const SUPPRESSED_DIAGNOSTIC_CODES = new Set([6059]);

function normalizeTypingSources(sourceConfig) {
  if (typeof sourceConfig === "string") {
    return {
      include: [sourceConfig],
      rootDir: sourceConfig,
      tsConfigLookupDir: sourceConfig,
    };
  }

  const include = sourceConfig?.include?.length
    ? sourceConfig.include
    : [path.join(cwd, "src")];
  const rootDir = sourceConfig?.rootDir ?? include[0];

  return {
    include,
    rootDir,
    tsConfigLookupDir: include[0],
  };
}

export function reportTSDiagnostics(diagnostics) {
  for (const diagnostic of diagnostics) {
    if (SUPPRESSED_DIAGNOSTIC_CODES.has(diagnostic.code)) {
      continue;
    }

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

export async function makeTypings(
  outDir,
  sourceConfig = path.join(cwd, "src"),
) {
  const normalizedSources = normalizeTypingSources(sourceConfig);
  const typescriptConfig = await getTypescriptConfig(
    cwd,
    normalizedSources.tsConfigLookupDir,
  );

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
  tsconfig.include = normalizedSources.include;
  tsconfig.compilerOptions = {
    ...tsconfig.compilerOptions,
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    declarationDir: path.join(outDir, "dist-types"),
    rootDir: normalizedSources.rootDir,
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
    .concat(emitResult.diagnostics)
    .filter((diagnostic) => !SUPPRESSED_DIAGNOSTIC_CODES.has(diagnostic.code));
  if (diagnostics.length > 0) {
    reportTSDiagnostics(diagnostics);
    throw new Error("Could not generate .d.ts files");
  }
}

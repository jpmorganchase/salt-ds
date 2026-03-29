#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");

const runtimeRoot = path.resolve(__dirname, "..");
const baseSchemaPath = path.join(
  runtimeRoot,
  "schemas",
  "project-conventions.schema.json",
);
const stackSchemaPath = path.join(
  runtimeRoot,
  "schemas",
  "project-conventions-stack.schema.json",
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function createValidators() {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });

  const conventionsSchema = readJson(baseSchemaPath);
  const stackSchema = readJson(stackSchemaPath);

  return {
    validateConventions: ajv.compile(conventionsSchema),
    validateStack: ajv.compile(stackSchema),
  };
}

function formatAjvErrors(errors) {
  return (errors ?? []).map((error) => {
    const instancePath = error.instancePath || "/";
    return `${instancePath}: ${error.message}`;
  });
}

function resolveDocumentKind(document, explicitKind) {
  if (explicitKind === "team" || explicitKind === "conventions") {
    return "conventions";
  }

  if (explicitKind === "stack") {
    return "stack";
  }

  if (document && document.contract === "project_conventions_stack_v1") {
    return "stack";
  }

  return "conventions";
}

function validateDocument(filePath, explicitKind) {
  try {
    const { validateConventions, validateStack } = createValidators();
    const document = readJson(filePath);
    const kind = resolveDocumentKind(document, explicitKind);
    const validator = kind === "stack" ? validateStack : validateConventions;
    const valid = validator(document);

    return {
      filePath,
      kind,
      valid: Boolean(valid),
      errors: valid ? [] : formatAjvErrors(validator.errors),
      document,
    };
  } catch (error) {
    return {
      filePath,
      kind: explicitKind === "stack" ? "stack" : "conventions",
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
      document: null,
    };
  }
}

function relativeFromRoot(rootDir, targetPath) {
  return path.relative(rootDir, targetPath).replaceAll("\\", "/");
}

function doctorProjectConventions(rootDir) {
  const absoluteRoot = path.resolve(rootDir);
  const saltDir = path.join(absoluteRoot, ".salt");
  const teamPath = path.join(saltDir, "team.json");
  const stackPath = path.join(saltDir, "stack.json");

  const warnings = [];
  const errors = [];

  const team = fileExists(teamPath)
    ? validateDocument(teamPath, "conventions")
    : null;
  const stack = fileExists(stackPath)
    ? validateDocument(stackPath, "stack")
    : null;

  const layers = [];

  if (!team && !stack) {
    errors.push(
      "No Salt project conventions found. Expected .salt/team.json or .salt/stack.json.",
    );
  }

  if (team && !team.valid) {
    errors.push(...team.errors.map((error) => `.salt/team.json ${error}`));
  }

  if (stack) {
    if (!stack.valid) {
      errors.push(...stack.errors.map((error) => `.salt/stack.json ${error}`));
    } else if (stack.document) {
      for (const layer of stack.document.layers ?? []) {
        if (layer.source?.type === "file") {
          const layerPath = path.resolve(
            path.dirname(stackPath),
            layer.source.path,
          );
          if (!fileExists(layerPath)) {
            errors.push(
              `Missing layer file for "${layer.id}": ${relativeFromRoot(
                absoluteRoot,
                layerPath,
              )}`,
            );
            layers.push({
              id: layer.id,
              scope: layer.scope,
              source: layer.source.path,
              valid: false,
              type: "file",
              errors: ["File not found."],
            });
            continue;
          }

          const layerValidation = validateDocument(layerPath, "conventions");
          if (!layerValidation.valid) {
            errors.push(
              ...layerValidation.errors.map(
                (error) =>
                  `${relativeFromRoot(absoluteRoot, layerPath)} ${error}`,
              ),
            );
          }

          layers.push({
            id: layer.id,
            scope: layer.scope,
            source: layer.source.path,
            valid: layerValidation.valid,
            type: "file",
            errors: layerValidation.errors,
          });
        } else if (layer.source?.type === "package") {
          layers.push({
            id: layer.id,
            scope: layer.scope,
            source: layer.source.export
              ? `${layer.source.specifier}#${layer.source.export}`
              : layer.source.specifier,
            valid: true,
            type: "package",
            errors: [],
          });
        }
      }

      const teamReferenced = (stack.document.layers ?? []).some(
        (layer) =>
          layer.source?.type === "file" && layer.source.path === "./team.json",
      );

      if (team && !teamReferenced) {
        warnings.push(
          ".salt/team.json exists but .salt/stack.json does not reference ./team.json.",
        );
      }
    }
  }

  return {
    rootDir: absoluteRoot,
    valid: errors.length === 0,
    team,
    stack,
    layers,
    warnings,
    errors,
  };
}

function printDoctorReport(report) {
  console.log("Salt Project Conventions Doctor");
  console.log(`Root: ${report.rootDir}`);
  console.log(
    `Team file: ${
      report.team
        ? `${report.team.valid ? "valid" : "invalid"} (.salt/team.json)`
        : "not found"
    }`,
  );
  console.log(
    `Stack file: ${
      report.stack
        ? `${report.stack.valid ? "valid" : "invalid"} (.salt/stack.json)`
        : "not found"
    }`,
  );

  if (report.layers.length > 0) {
    console.log("Layers:");
    for (const layer of report.layers) {
      const status = layer.valid ? "valid" : "invalid";
      console.log(
        `- ${layer.id} [${layer.scope}] ${layer.type}: ${layer.source} (${status})`,
      );
      for (const error of layer.errors) {
        console.log(`  error: ${error}`);
      }
    }
  }

  if (report.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of report.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (report.errors.length > 0) {
    console.log("Errors:");
    for (const error of report.errors) {
      console.log(`- ${error}`);
    }
  }

  console.log(`Status: ${report.valid ? "valid" : "invalid"}`);
}

function printValidateReport(report) {
  console.log(
    `${report.valid ? "Valid" : "Invalid"} ${
      report.kind === "stack" ? "stack" : "conventions"
    } file: ${report.filePath}`,
  );

  for (const error of report.errors) {
    console.log(`- ${error}`);
  }
}

function printUsage() {
  console.log("Usage:");
  console.log("  salt-project-conventions doctor [repo-root]");
  console.log("  salt-project-conventions validate <file> [--kind team|stack]");
}

function main(argv) {
  const [command, ...rest] = argv;

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return 0;
  }

  if (command === "doctor") {
    const rootDir = rest[0] ?? process.cwd();
    const report = doctorProjectConventions(rootDir);
    printDoctorReport(report);
    return report.valid ? 0 : 1;
  }

  if (command === "validate") {
    const filePathArg = rest.find((arg) => !arg.startsWith("--"));
    const kindIndex = rest.findIndex((arg) => arg === "--kind");
    const explicitKind =
      kindIndex >= 0 && rest[kindIndex + 1] ? rest[kindIndex + 1] : undefined;

    if (!filePathArg) {
      printUsage();
      return 1;
    }

    const absolutePath = path.resolve(filePathArg);
    if (!fileExists(absolutePath)) {
      console.error(`File not found: ${absolutePath}`);
      return 1;
    }

    const report = validateDocument(absolutePath, explicitKind);
    printValidateReport(report);
    return report.valid ? 0 : 1;
  }

  printUsage();
  return 1;
}

process.exitCode = main(process.argv.slice(2));

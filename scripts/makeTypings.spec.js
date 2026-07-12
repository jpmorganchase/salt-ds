import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";

import { assertSuccessfulTypeEmit } from "./makeTypings.mjs";

const temporaryDirectories = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { force: true, recursive: true });
  }
});

describe("declaration diagnostics", () => {
  it("fails a declaration-invalid source in CI mode", () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "salt-typings-"));
    temporaryDirectories.push(directory);
    const sourceFile = path.join(directory, "index.ts");
    fs.writeFileSync(sourceFile, "export const value: string = 42;\n");

    const program = ts.createProgram([sourceFile], {
      declaration: true,
      emitDeclarationOnly: true,
      noEmitOnError: true,
      outDir: path.join(directory, "types"),
    });
    const emitResult = program.emit();
    vi.stubEnv("CI", "true");
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => assertSuccessfulTypeEmit(program, emitResult)).toThrow(
      "Could not generate .d.ts files",
    );
  });
});

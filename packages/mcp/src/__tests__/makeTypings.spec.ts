import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCompilerHost: vi.fn(() => ({})),
  createProgram: vi.fn(() => ({
    emit: vi.fn(() => ({ diagnostics: [] })),
  })),
  getTypescriptConfig: vi.fn(),
  parseJsonConfigFileContent: vi.fn(() => ({
    errors: [],
    fileNames: [],
    options: {},
  })),
}));

vi.mock("ci-info", () => ({ isCI: true }));
vi.mock("fs-extra", () => ({
  default: {
    mkdirpSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));
vi.mock("typescript", () => ({
  default: {
    createCompilerHost: mocks.createCompilerHost,
    createProgram: mocks.createProgram,
    parseJsonConfigFileContent: mocks.parseJsonConfigFileContent,
    sys: {},
  },
}));
vi.mock("../../../../scripts/utils.mjs", () => ({
  getTypescriptConfig: mocks.getTypescriptConfig,
}));

import { makeTypings } from "../../../../scripts/makeTypings.mjs";

const baseTypescriptConfig = {
  compilerOptions: {
    module: "NodeNext",
  },
};

describe("makeTypings call contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getTypescriptConfig.mockResolvedValue(baseTypescriptConfig);
  });

  it("uses the workspace src directory when sourceConfig is omitted", async () => {
    const outDir = path.join("fixture", "dist");
    const defaultSource = path.join(process.cwd(), "src");

    await makeTypings(outDir);

    expect(mocks.getTypescriptConfig).toHaveBeenCalledWith(
      process.cwd(),
      defaultSource,
    );
    expect(mocks.parseJsonConfigFileContent).toHaveBeenCalledWith(
      expect.objectContaining({
        include: [defaultSource],
        compilerOptions: expect.objectContaining({
          declarationDir: path.join(outDir, "dist-types"),
          rootDir: defaultSource,
        }),
      }),
      expect.anything(),
      ".",
    );
  });

  it("supports the existing two-argument string source form", async () => {
    const sourceDir = path.join(
      process.cwd(),
      "packages",
      "date-adapters",
      "src",
    );

    await makeTypings(path.join("fixture", "dist"), sourceDir);

    expect(mocks.getTypescriptConfig).toHaveBeenCalledWith(
      process.cwd(),
      sourceDir,
    );
    expect(mocks.parseJsonConfigFileContent).toHaveBeenCalledWith(
      expect.objectContaining({
        include: [sourceDir],
        compilerOptions: expect.objectContaining({
          rootDir: sourceDir,
        }),
      }),
      expect.anything(),
      ".",
    );
  });

  it("uses the three-argument TypeScript override without loading a config", async () => {
    const override = {
      exclude: ["dist"],
      compilerOptions: {
        module: "ESNext",
        noEmit: true,
        strict: true,
      },
    };
    const originalOverride = structuredClone(override);
    const sourceConfig = {
      include: ["src/index.ts"],
      rootDir: "src",
    };

    await makeTypings("dist", sourceConfig, override);

    expect(mocks.getTypescriptConfig).not.toHaveBeenCalled();
    expect(mocks.parseJsonConfigFileContent).toHaveBeenCalledWith(
      expect.objectContaining({
        exclude: ["dist"],
        include: ["src/index.ts"],
        compilerOptions: expect.objectContaining({
          module: "ESNext",
          noEmit: false,
          strict: true,
          rootDir: "src",
        }),
      }),
      expect.anything(),
      ".",
    );
    expect(override).toEqual(originalOverride);
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as publicApi from "../index.js";
import { parseSaltMcpArgs } from "../cli.js";

describe("clean v1 package and CLI surface", () => {
  it("exports only the factory value from the package root", () => {
    expect(Object.keys(publicApi)).toEqual(["createSaltMcpServer"]);
  });

  it("accepts only repeatable startup roots", () => {
    expect(parseSaltMcpArgs([])).toEqual({ command: "serve", projectRoots: [] });
    expect(
      parseSaltMcpArgs(["serve", "--root", "one", "--root", "two"]),
    ).toEqual({ command: "serve", projectRoots: ["one", "two"] });
    expect(() => parseSaltMcpArgs(["--registry-dir", "registry"])).toThrow(
      /unknown option/iu,
    );
    expect(() => parseSaltMcpArgs(["--workspace-root", "project"])).toThrow(
      /unknown option/iu,
    );
  });

  it("contains no prototype identity, Roots, compiler, or generator surface", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve("packages/mcp/package.json"), "utf8"),
    );
    expect(packageJson.dependencies["@modelcontextprotocol/server"]).toBe("2.0.0");
    expect(packageJson.devDependencies["@modelcontextprotocol/client"]).toBe("2.0.0");
    expect(packageJson.scripts["build:registry"]).toBeUndefined();
    expect(packageJson.publishBuildIdentityManifest).toBeUndefined();
    expect(packageJson.dependencies).not.toHaveProperty("@salt-ds/catalog-compiler");

    const source = fs
      .readdirSync(path.resolve("packages/mcp/src/server"), {
        recursive: true,
        withFileTypes: true,
      })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
      .map((entry) => fs.readFileSync(path.join(entry.parentPath, entry.name), "utf8"))
      .join("\n");
    expect(source).not.toContain("salt://");
    expect(source).not.toContain('"roots/list"');
    expect(source).not.toContain("registryDir");
    expect(source).not.toContain("unrestricted_local_stdio");
  });

  it("preserves one-way MCP to Knowledge dependency", () => {
    const knowledgeFiles = fs
      .readdirSync(path.resolve("packages/knowledge/src"), {
        recursive: true,
        withFileTypes: true,
      })
      .filter(
        (entry) =>
          entry.isFile() &&
          /\.[cm]?[jt]sx?$/u.test(entry.name) &&
          !entry.parentPath.split(path.sep).includes("__tests__"),
      );
    for (const entry of knowledgeFiles) {
      expect(
        fs.readFileSync(path.join(entry.parentPath, entry.name), "utf8"),
      ).not.toContain("@salt-ds/mcp");
    }
  });
});

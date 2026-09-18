import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SALT_SCAN_LIMIT_DEFAULTS } from "../limits.js";
import { loadSaltConfig, SaltConfigError } from "../loadConfig.js";

const temporaryRoots: string[] = [];

async function fixtureRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-cli-config-"));
  temporaryRoots.push(root);
  return root;
}

async function writeConfig(root: string, value: unknown): Promise<void> {
  await fs.writeFile(
    path.join(root, "salt.config.json"),
    typeof value === "string" ? value : JSON.stringify(value),
    "utf8",
  );
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("salt.config.json", () => {
  it("keeps the packed schema limit maxima aligned with executable defaults", async () => {
    const schema = JSON.parse(
      await fs.readFile(
        new URL("../../../schemas/salt-config-1.schema.json", import.meta.url),
        "utf8",
      ),
    ) as {
      properties: {
        limits: { properties: Record<string, { maximum: number }> };
      };
    };
    expect(
      Object.fromEntries(
        Object.entries(schema.properties.limits.properties).map(
          ([name, definition]) => [name, definition.maximum],
        ),
      ),
    ).toEqual(SALT_SCAN_LIMIT_DEFAULTS);
  });

  it("returns every ratified default without requiring configuration", async () => {
    const root = await fixtureRoot();
    await expect(loadSaltConfig({ authorityRoot: root })).resolves.toEqual({
      schema_version: "1.0.0",
      source: "default",
      include: [],
      exclude: [],
      limits: SALT_SCAN_LIMIT_DEFAULTS,
    });
  });

  it("accepts portable patterns and limits that lower defaults", async () => {
    const root = await fixtureRoot();
    await writeConfig(root, {
      $schema: "https://www.saltdesignsystem.com/ai/schemas/salt-config-1.json",
      include: ["src/**/*.ts"],
      exclude: ["src/generated/**"],
      limits: {
        selected_files: 12,
        selected_aggregate_bytes: 4096,
        forced_worker_restarts: 0,
      },
    });
    const config = await loadSaltConfig({ authorityRoot: root });
    expect(config).toMatchObject({
      source: "salt.config.json",
      include: ["src/**/*.ts"],
      exclude: ["src/generated/**"],
      limits: {
        selected_files: 12,
        selected_aggregate_bytes: 4096,
        forced_worker_restarts: 0,
      },
    });
    expect(config.limits.traversal_depth).toBe(32);
  });

  it.each([
    [{ surprise: true }, "SALT_CONFIG_UNKNOWN_KEY"],
    [{ limits: { mystery: 1 } }, "SALT_CONFIG_UNKNOWN_KEY"],
    [{ limits: { selected_files: 5001 } }, "SALT_CONFIG_INVALID_LIMIT"],
    [{ limits: { selected_files: 0 } }, "SALT_CONFIG_INVALID_LIMIT"],
    [{ include: ["../outside.ts"] }, "SALT_CONFIG_INVALID_PATTERN"],
    [{ exclude: ["C:/outside/**"] }, "SALT_CONFIG_INVALID_PATTERN"],
    [{ include: ["src\\file.ts"] }, "SALT_CONFIG_INVALID_PATTERN"],
    [{ include: ["src/*.ts", "src/*.ts"] }, "SALT_CONFIG_INVALID_PATTERN"],
  ])("fails closed for invalid configuration %#", async (value, reason) => {
    const root = await fixtureRoot();
    await writeConfig(root, value);
    await expect(loadSaltConfig({ authorityRoot: root })).rejects.toMatchObject(
      {
        code: "SALT_CONFIG_INVALID",
        exitCode: 2,
        reason,
      },
    );
  });

  it("rejects malformed JSON as a configuration error", async () => {
    const root = await fixtureRoot();
    await writeConfig(root, "{not-json");
    await expect(
      loadSaltConfig({ authorityRoot: root }),
    ).rejects.toBeInstanceOf(SaltConfigError);
  });

  it("rejects a multiply-linked configuration file", async () => {
    const root = await fixtureRoot();
    const configPath = path.join(root, "salt.config.json");
    await writeConfig(root, {});
    await fs.link(configPath, path.join(root, "config-copy.json"));
    await expect(loadSaltConfig({ authorityRoot: root })).rejects.toMatchObject(
      {
        reason: "SALT_CONFIG_UNSAFE_FILE",
        exitCode: 2,
      },
    );
  });
});

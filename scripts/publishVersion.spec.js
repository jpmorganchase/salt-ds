import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFile, readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", async () => {
  const { promisify } = await import("node:util");
  const execFile = vi.fn();
  execFile[promisify.custom] = execFile;
  return { execFile };
});
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  appendFile: vi.fn(),
}));

const execFile = promisify(execFileCallback);
const originalArgv = process.argv;
const name = "@salt-ds/styles";
const version = "0.4.0";
const releaseTag = `${name}@${version}`;
const releaseCommit = "5f14231aaed03b04b1dc0fa0ac6eba876df32161";
const workflowCommit = "e10fccdb838b86812155de3bc462c9c011e7ffbb";

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  vi.stubEnv("GITHUB_REF", "refs/heads/main");
  vi.stubEnv("GITHUB_SHA", workflowCommit);
  vi.stubEnv("GITHUB_STEP_SUMMARY", "summary.md");
  vi.spyOn(console, "log").mockImplementation(() => {});
  process.argv = [
    process.execPath,
    "publishVersion.mjs",
    "--artifact",
    "artifact",
    "--release-tag",
    releaseTag,
    "--commit",
    releaseCommit,
    "--npm-tag",
    "latest",
  ];
  const tarball = Buffer.from("test tarball");
  readFile.mockResolvedValueOnce(
    JSON.stringify({
      version: 1,
      releaseTag,
      commit: releaseCommit,
      npmTag: "latest",
      package: {
        name,
        version,
        tarball: "package.tgz",
        integrity: `sha256-${createHash("sha256").update(tarball).digest("base64")}`,
      },
    }),
  );
  readFile.mockResolvedValueOnce(tarball);
});

afterEach(() => {
  process.argv = originalArgv;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function mockRegistry(latestOutput) {
  let published = false;
  execFile.mockImplementation(async (command, args) => {
    if (command === "tar") {
      return { stdout: JSON.stringify({ name, version }) };
    }
    if (command === "npm") {
      if (args[0] === "--version") {
        return { stdout: "11.11.0\n" };
      }
      if (args[0] === "view" && args[2] === "dist-tags.latest") {
        return { stdout: published ? JSON.stringify(version) : latestOutput };
      }
      if (args[0] === "view" && args[2] === "version") {
        if (!published) {
          throw Object.assign(new Error("Not found"), { stderr: "E404" });
        }
        return { stdout: JSON.stringify(version) };
      }
      if (args[0] === "publish") {
        published = true;
        return { stdout: "" };
      }
    }
    throw new Error(`Unexpected command: ${command} ${args.join(" ")}`);
  });
}

describe("publishVersion", () => {
  it("keeps the workflow identity used by the provenance signing certificate", async () => {
    mockRegistry('"0.3.0"');

    await import("./publishVersion.mjs");

    const publishCall = execFile.mock.calls.find(
      ([command, args]) => command === "npm" && args[0] === "publish",
    );
    expect(publishCall).toBeDefined();
    expect(publishCall[1]).toContain("--provenance");
    const publishEnv = publishCall[2]?.env ?? process.env;
    expect(publishEnv.GITHUB_REF).toBe("refs/heads/main");
    expect(publishEnv.GITHUB_SHA).toBe(workflowCommit);
    expect(process.env.GITHUB_REF).toBe("refs/heads/main");
    expect(process.env.GITHUB_SHA).toBe(workflowCommit);
    expect(appendFile).toHaveBeenCalledWith(
      "summary.md",
      expect.stringContaining(
        `Source: \`${releaseTag}\` (\`${releaseCommit}\`)`,
      ),
    );
  });

  it.each(["", " \n\t"])(
    "publishes an existing package with no latest tag (stdout: %j)",
    async (stdout) => {
      mockRegistry(stdout);
      await import("./publishVersion.mjs");
      expect(console.log).toHaveBeenCalledWith(
        `Published ${name}@${version} as npm latest.`,
      );
    },
  );

  it.each(["null", "123", "{}"])(
    "rejects a non-string latest response (%s)",
    async (stdout) => {
      mockRegistry(stdout);
      await expect(import("./publishVersion.mjs")).rejects.toThrow(
        `npm did not report a latest version for ${name}`,
      );
      expect(
        execFile.mock.calls.some(([, args]) => args[0] === "publish"),
      ).toBe(false);
    },
  );
});

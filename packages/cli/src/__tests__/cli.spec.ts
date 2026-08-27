import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseCliArgs,
  runCliWithIo,
  SALT_CLI_HELP,
  SaltCliUsageError,
} from "../cli.js";

const runInfoCommand = vi.hoisted(() => vi.fn());

vi.mock("../commands/info.js", () => ({ runInfoCommand }));

function captureIo() {
  let stdout = "";
  return {
    io: {
      cwd: () => "D:/fixture",
      stdout: (value: string) => {
        stdout += value;
      },
    },
    stdout: () => stdout,
  };
}

describe("Salt CLI shell", () => {
  beforeEach(() => {
    runInfoCommand.mockReset();
    runInfoCommand.mockResolvedValue({ contract: "salt-cli-info/1" });
  });

  it.each([["help"], ["-h"], ["--help"]])(
    "renders %s as the exact help alias",
    async (command) => {
      const capture = captureIo();
      await expect(runCliWithIo([command], capture.io)).resolves.toBe(0);
      expect(capture.stdout()).toBe(SALT_CLI_HELP);
    },
  );

  it.each([["version"], ["--version"]])(
    "renders %s as the exact version alias",
    async (command) => {
      const capture = captureIo();
      await expect(runCliWithIo([command], capture.io)).resolves.toBe(0);
      expect(capture.stdout()).toBe("0.0.0\n");
    },
  );

  it("requires an explicit command and rejects trailing alias arguments", () => {
    expect(() => parseCliArgs([])).toThrow(SaltCliUsageError);
    for (const argv of [
      ["help", "extra"],
      ["-h", "extra"],
      ["--help", "extra"],
      ["version", "extra"],
      ["--version", "extra"],
    ]) {
      expect(() => parseCliArgs(argv)).toThrow(/accepts no arguments/u);
    }
  });

  it("parses info with one optional root and one required JSON renderer", () => {
    expect(parseCliArgs(["info", "--json"])).toEqual({
      command: "info",
      rootDir: null,
      format: "json",
    });
    expect(parseCliArgs(["info", "D:/project", "--json"])).toEqual({
      command: "info",
      rootDir: "D:/project",
      format: "json",
    });
    expect(parseCliArgs(["info", "--json", "D:/project"])).toEqual({
      command: "info",
      rootDir: "D:/project",
      format: "json",
    });
  });

  it.each([
    ["info"],
    ["info", "--json", "--json"],
    ["info", "one", "two", "--json"],
    ["info", "--yaml"],
    ["unknown"],
  ])("rejects invalid arguments: %s", (...argv) => {
    expect(() => parseCliArgs(argv)).toThrow(SaltCliUsageError);
  });

  it("uses cwd by default and emits JSON only", async () => {
    const capture = captureIo();
    await runCliWithIo(["info", "--json"], capture.io);
    expect(runInfoCommand).toHaveBeenCalledWith({
      rootDir: "D:/fixture",
      cliVersion: "0.0.0",
    });
    expect(capture.stdout()).toBe('{"contract":"salt-cli-info/1"}\n');
  });

  it("maps invalid project roots to the CLI usage contract", async () => {
    runInfoCommand.mockRejectedValue(
      Object.assign(new Error("Project root is unavailable."), {
        code: "SALT_PROJECT_ROOT_UNAVAILABLE",
      }),
    );
    const capture = captureIo();
    await expect(
      runCliWithIo(["info", "missing", "--json"], capture.io),
    ).rejects.toMatchObject({
      code: "SALT_CLI_USAGE",
      exitCode: 2,
      message: "Project root is unavailable.",
    });
    expect(capture.stdout()).toBe("");
  });
});

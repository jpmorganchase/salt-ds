import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseCliArgs,
  runCliWithIo,
  SALT_CLI_HELP,
  SaltCliUsageError,
} from "../cli.js";

const runInfoCommand = vi.hoisted(() => vi.fn());
const runScanCommand = vi.hoisted(() => vi.fn());

vi.mock("../commands/info.js", () => ({ runInfoCommand }));
vi.mock("../commands/scan.js", () => ({ runScanCommand }));

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
    runScanCommand.mockReset();
    runScanCommand.mockResolvedValue({
      output: '{"contract":"salt-scan-result/1"}\n',
      exitCode: 0,
    });
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

  it("strictly parses the scan command and its required options", () => {
    expect(
      parseCliArgs([
        "scan",
        "D:/project",
        "--format",
        "sarif",
        "--fail-on",
        "warning",
        "--allow-incomplete",
      ]),
    ).toEqual({
      command: "scan",
      rootDir: "D:/project",
      format: "sarif",
      failOn: "warning",
      allowIncomplete: true,
    });
  });

  it.each([
    ["scan"],
    ["scan", "--format", "json"],
    ["scan", "--fail-on", "error"],
    ["scan", "--format", "xml", "--fail-on", "error"],
    ["scan", "--format", "json", "--fail-on", "fatal"],
    ["scan", "--format", "json", "--format", "pretty", "--fail-on", "error"],
    [
      "scan",
      "--format",
      "json",
      "--fail-on",
      "error",
      "--allow-incomplete",
      "--allow-incomplete",
    ],
  ])("rejects invalid scan arguments: %s", (...argv) => {
    expect(() => parseCliArgs(argv)).toThrow(SaltCliUsageError);
  });

  it("writes only the selected scan document and returns its exit code", async () => {
    runScanCommand.mockResolvedValue({ output: "scan-output\n", exitCode: 1 });
    const capture = captureIo();
    await expect(
      runCliWithIo(
        ["scan", "--format", "pretty", "--fail-on", "warning"],
        capture.io,
      ),
    ).resolves.toBe(1);
    expect(runScanCommand).toHaveBeenCalledWith({
      rootDir: "D:/fixture",
      cliVersion: "0.0.0",
      format: "pretty",
      failOn: "warning",
      allowIncomplete: false,
    });
    expect(capture.stdout()).toBe("scan-output\n");
  });

  it("keeps operational scan failures on the exit-3 stderr contract", async () => {
    runScanCommand.mockRejectedValue(new Error("repository secret"));
    const capture = captureIo();
    await expect(
      runCliWithIo(
        ["scan", "--format", "json", "--fail-on", "never"],
        capture.io,
      ),
    ).rejects.toMatchObject({
      code: "SALT_CLI_SCAN_FAILED",
      exitCode: 3,
      message: "The scan could not be completed.",
    });
    expect(capture.stdout()).toBe("");
  });
});

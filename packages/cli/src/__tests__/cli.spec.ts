import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseCliArgs,
  runCliWithIo,
  SALT_CLI_HELP,
  SaltCliUsageError,
} from "../cli.js";

const runInfoCommand = vi.hoisted(() => vi.fn());
const runDocsCommand = vi.hoisted(() => vi.fn());
const runContextCommand = vi.hoisted(() => vi.fn());
const runSkillCommand = vi.hoisted(() => vi.fn());

vi.mock("../commands/context.js", () => ({ runContextCommand }));
vi.mock("../commands/docs.js", () => ({ runDocsCommand }));
vi.mock("../commands/info.js", () => ({ runInfoCommand }));
vi.mock("../commands/skill.js", () => ({ runSkillCommand }));

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
    runDocsCommand.mockReset();
    runDocsCommand.mockResolvedValue({
      output: '{"contract":"salt-knowledge-document/1"}\n',
      exitCode: 0,
    });
    runContextCommand.mockReset();
    runContextCommand.mockResolvedValue({
      output: '{"contract":"salt-knowledge-context/1"}\n',
      exitCode: 0,
    });
    runSkillCommand.mockReset();
    runSkillCommand.mockResolvedValue("skill-output\n");
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
      Object.assign(new Error("C:\\Users\\private\u001b[31mroot"), {
        code: "SALT_PROJECT_ROOT_UNAVAILABLE",
      }),
    );
    const capture = captureIo();
    await expect(
      runCliWithIo(["info", "missing", "--json"], capture.io),
    ).rejects.toMatchObject({
      code: "SALT_CLI_USAGE",
      exitCode: 2,
      message: "The project root is invalid or unavailable.",
    });
    expect(capture.stdout()).toBe("");
  });

  it("strictly parses docs and context retrieval commands", () => {
    expect(
      parseCliArgs(["docs", "component.button", "--format", "markdown"]),
    ).toEqual({
      command: "docs",
      identifier: "component.button",
      format: "markdown",
    });
    expect(
      parseCliArgs([
        "context",
        "button appearance",
        "--format",
        "json",
        "--limit",
        "5",
      ]),
    ).toEqual({
      command: "context",
      query: "button appearance",
      format: "json",
      limit: 5,
    });
  });

  it("strictly parses and runs the skill subcommands", async () => {
    expect(parseCliArgs(["skill", "info", "--json"])).toEqual({
      command: "skill",
      action: "info",
      kind: null,
    });
    expect(parseCliArgs(["skill", "print", "--kind", "agents"])).toEqual({
      command: "skill",
      action: "print",
      kind: "agents",
    });
    for (const argv of [
      ["skill"],
      ["skill", "info"],
      ["skill", "print", "--kind", "fake"],
      ["skill", "print", "--kind", "skill", "extra"],
    ]) {
      expect(() => parseCliArgs(argv)).toThrow(SaltCliUsageError);
    }
    const capture = captureIo();
    await expect(
      runCliWithIo(["skill", "print", "--kind", "skill"], capture.io),
    ).resolves.toBe(0);
    expect(runSkillCommand).toHaveBeenCalledWith({
      action: "print",
      kind: "skill",
    });
    expect(capture.stdout()).toBe("skill-output\n");
  });

  it.each([
    ["docs"],
    ["docs", "Button"],
    ["docs", "Button", "--format", "yaml"],
    ["docs", "Button", "Link", "--format", "json"],
    ["context"],
    ["context", "button", "--format", "json"],
    ["context", "button", "--format", "json", "--limit", "0"],
    ["context", "button", "--format", "json", "--limit", "101"],
  ])("rejects invalid retrieval arguments: %s", (...argv) => {
    expect(() => parseCliArgs(argv)).toThrow(SaltCliUsageError);
  });

  it("runs docs and context against cwd and preserves result exit codes", async () => {
    const docsCapture = captureIo();
    runDocsCommand.mockResolvedValue({ output: "choices\n", exitCode: 1 });
    await expect(
      runCliWithIo(["docs", "Button", "--format", "markdown"], docsCapture.io),
    ).resolves.toBe(1);
    expect(runDocsCommand).toHaveBeenCalledWith({
      rootDir: "D:/fixture",
      identifier: "Button",
      format: "markdown",
    });
    expect(docsCapture.stdout()).toBe("choices\n");

    const contextCapture = captureIo();
    await expect(
      runCliWithIo(
        ["context", "Button", "--format", "json", "--limit", "5"],
        contextCapture.io,
      ),
    ).resolves.toBe(0);
    expect(runContextCommand).toHaveBeenCalledWith({
      rootDir: "D:/fixture",
      query: "Button",
      format: "json",
      limit: 5,
    });
  });

  it("rejects scan because it is not a public command", () => {
    expect(() => parseCliArgs(["scan"])).toThrow(/Unknown command: scan/u);
    expect(SALT_CLI_HELP).not.toMatch(/\bscan\b/u);
  });

  it("does not resolve until asynchronous stdout has flushed", async () => {
    let release!: () => void;
    const pendingWrite = new Promise<void>((resolve) => {
      release = resolve;
    });
    const stdout = vi.fn(() => pendingWrite);
    let completed = false;
    const run = runCliWithIo(["version"], {
      cwd: () => "D:/fixture",
      stdout,
    }).then((exitCode) => {
      completed = true;
      return exitCode;
    });

    expect(stdout).toHaveBeenCalledWith("0.0.0\n");
    await Promise.resolve();
    expect(completed).toBe(false);
    release();
    await expect(run).resolves.toBe(0);
  });
});

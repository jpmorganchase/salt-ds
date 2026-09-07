import path from "node:path";
import { KnowledgeContextInputError } from "@salt-ds/knowledge";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseCliArgs,
  runCli,
  runCliWithIo,
  SALT_CLI_HELP,
  SaltCliUsageError,
} from "../cli.js";

const runInfoCommand = vi.hoisted(() => vi.fn());
const runDocsCommand = vi.hoisted(() => vi.fn());
const runContextCommand = vi.hoisted(() => vi.fn());
const runDoctorCommand = vi.hoisted(() => vi.fn());
const runSkillCommand = vi.hoisted(() => vi.fn());

vi.mock("../commands/context.js", () => ({ runContextCommand }));
vi.mock("../commands/docs.js", () => ({ runDocsCommand }));
vi.mock("../commands/doctor.js", () => ({ runDoctorCommand }));
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
    runDoctorCommand.mockReset();
    runDoctorCommand.mockResolvedValue({
      output: '{"contract":"salt-doctor-result/1"}\n',
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

  it("parses info selection flags and a required JSON renderer", () => {
    expect(parseCliArgs(["info", "--json"])).toEqual({
      command: "info",
      rootDir: null,
      project: ".",
      format: "json",
    });
    expect(
      parseCliArgs([
        "info",
        "--project",
        "apps/one",
        "--json",
        "--root",
        "D:/project",
      ]),
    ).toEqual({
      command: "info",
      rootDir: "D:/project",
      project: "apps/one",
      format: "json",
    });
  });

  it.each([
    ["info"],
    ["info", "--json", "--json"],
    ["info", "one", "two", "--json"],
    ["info", "one", "--json"],
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
      project: ".",
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
      runCliWithIo(["info", "--root", "missing", "--json"], capture.io),
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
      rootDir: null,
      project: ".",
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
      rootDir: null,
      project: ".",
      query: "button appearance",
      format: "json",
      limit: 5,
    });
  });

  it("shares bounded selection grammar across project-bound commands", () => {
    expect(
      parseCliArgs([
        "docs",
        "--root",
        "repo",
        "Button",
        "--project",
        "apps/one",
        "--format",
        "json",
      ]),
    ).toEqual({
      command: "docs",
      rootDir: "repo",
      project: "apps/one",
      identifier: "Button",
      format: "json",
    });
    expect(
      parseCliArgs([
        "context",
        "--project",
        "apps/two",
        "Button",
        "--limit",
        "5",
        "--root",
        "repo",
        "--format",
        "markdown",
      ]),
    ).toEqual({
      command: "context",
      rootDir: "repo",
      project: "apps/two",
      query: "Button",
      format: "markdown",
      limit: 5,
    });
  });

  it.each([
    ["info", "--root", "", "--json"],
    ["info", "--root", "\0", "--json"],
    ["info", "--root", "one", "--root", "two", "--json"],
    ["info", "--project", "", "--json"],
    ["info", "--project", "\0", "--json"],
    ["info", "--project", "apps/one", "--project", "apps/two", "--json"],
    ["info", "--project", "/absolute", "--json"],
    ["info", "--project", "C:/absolute", "--json"],
    ["info", "--project", "C:child", "--json"],
    ["info", "--project", "apps/../two", "--json"],
    ["docs", "Button", "--root", "--format", "json"],
    [
      "context",
      "Button",
      "--project",
      "..",
      "--format",
      "json",
      "--limit",
      "5",
    ],
  ])("rejects unsafe or incomplete selection arguments: %s", (...argv) => {
    expect(() => parseCliArgs(argv)).toThrow(SaltCliUsageError);
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

  it("strictly parses and runs the public Doctor command", async () => {
    expect(
      parseCliArgs([
        "doctor",
        "D:/project",
        "--format",
        "prompt",
        "--fail-on",
        "warning",
      ]),
    ).toEqual({
      command: "doctor",
      rootDir: "D:/project",
      format: "prompt",
      failOn: "warning",
    });
    expect(
      parseCliArgs(["doctor", "--fail-on", "never", "--format", "json"]),
    ).toEqual({
      command: "doctor",
      rootDir: null,
      format: "json",
      failOn: "never",
    });
    for (const argv of [
      ["doctor"],
      ["doctor", "--format", "json"],
      ["doctor", "--format", "pretty", "--fail-on", "never"],
      ["doctor", "--format", "json", "--fail-on", "info"],
      [
        "doctor",
        "--format",
        "json",
        "--format",
        "prompt",
        "--fail-on",
        "never",
      ],
      ["doctor", "one", "two", "--format", "json", "--fail-on", "never"],
    ]) {
      expect(() => parseCliArgs(argv)).toThrow(SaltCliUsageError);
    }

    const capture = captureIo();
    await expect(
      runCliWithIo(
        ["doctor", "--format", "json", "--fail-on", "never"],
        capture.io,
      ),
    ).resolves.toBe(0);
    expect(runDoctorCommand).toHaveBeenCalledWith({
      rootDir: "D:/fixture",
      cliVersion: "0.0.0",
      format: "json",
      failOn: "never",
    });
    expect(capture.stdout()).toBe('{"contract":"salt-doctor-result/1"}\n');
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
      project: ".",
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
      project: ".",
      query: "Button",
      format: "json",
      limit: 5,
    });
  });

  it("forwards an explicit authority and selected application without auto-selection", async () => {
    const capture = captureIo();
    await runCliWithIo(
      [
        "docs",
        "Button",
        "--project",
        "apps/one",
        "--root",
        "repository",
        "--format",
        "json",
      ],
      capture.io,
    );
    expect(runDocsCommand).toHaveBeenCalledWith({
      rootDir: path.resolve("D:/fixture", "repository"),
      project: "apps/one",
      identifier: "Button",
      format: "json",
    });

    await runCliWithIo(
      [
        "context",
        "Button",
        "--root",
        "repository",
        "--format",
        "json",
        "--limit",
        "5",
        "--project",
        "apps/two",
      ],
      capture.io,
    );
    expect(runContextCommand).toHaveBeenCalledWith({
      rootDir: path.resolve("D:/fixture", "repository"),
      project: "apps/two",
      query: "Button",
      format: "json",
      limit: 5,
    });
  });

  it.each(["docs", "context", "info"])(
    "maps %s root inspection errors to usage without echoing a path",
    async (command) => {
      const failure = Object.assign(new Error("C:\\private\\repository"), {
        code: "SALT_PROJECT_ROOT_UNAVAILABLE",
      });
      if (command === "docs") runDocsCommand.mockRejectedValue(failure);
      else if (command === "context")
        runContextCommand.mockRejectedValue(failure);
      else runInfoCommand.mockRejectedValue(failure);

      const arguments_ =
        command === "docs"
          ? ["docs", "Button", "--root", "missing", "--format", "json"]
          : command === "context"
            ? [
                "context",
                "Button",
                "--root",
                "missing",
                "--format",
                "json",
                "--limit",
                "5",
              ]
            : ["info", "--root", "missing", "--json"];
      const capture = captureIo();
      await expect(runCliWithIo(arguments_, capture.io)).rejects.toMatchObject({
        code: "SALT_CLI_USAGE",
        exitCode: 2,
        message: "The project root is invalid or unavailable.",
      });
      expect(capture.stdout()).toBe("");
    },
  );

  it.each(["json", "markdown"])(
    "maps context budget rejection to a concise usage error for %s",
    async (format) => {
      runContextCommand.mockRejectedValue(
        new KnowledgeContextInputError("private query content"),
      );
      const capture = captureIo();
      await expect(
        runCliWithIo(
          [
            "context",
            "private query content",
            "--format",
            format,
            "--limit",
            "5",
          ],
          capture.io,
        ),
      ).rejects.toMatchObject({
        code: "SALT_CLI_USAGE",
        exitCode: 2,
        message:
          "Context input cannot fit the 16 KiB output budget. Use a shorter query.",
      });
      expect(capture.stdout()).toBe("");
    },
  );

  it("preserves unexpected context failures instead of labelling them usage errors", async () => {
    const failure = new Error("unexpected retrieval failure");
    runContextCommand.mockRejectedValue(failure);
    const capture = captureIo();
    await expect(
      runCliWithIo(
        ["context", "Button", "--format", "json", "--limit", "5"],
        capture.io,
      ),
    ).rejects.toBe(failure);
    expect(capture.stdout()).toBe("");
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

  it.each(["callback-then-event", "event-only"] as const)(
    "settles once when stdout reports EPIPE via %s",
    async (delivery) => {
      const listenerCount = process.stdout.listenerCount("error");
      const brokenPipe = Object.assign(new Error("broken pipe"), {
        code: "EPIPE",
      });
      const write = vi.spyOn(process.stdout, "write").mockImplementation(((
        _: string,
        callback: (error?: Error | null) => void,
      ) => {
        if (delivery === "callback-then-event") callback(brokenPipe);
        process.stdout.emit("error", brokenPipe);
        return false;
      }) as typeof process.stdout.write);

      try {
        await expect(runCli(["help"])).rejects.toBe(brokenPipe);
        expect(process.stdout.listenerCount("error")).toBe(listenerCount);
      } finally {
        write.mockRestore();
      }
    },
  );
});

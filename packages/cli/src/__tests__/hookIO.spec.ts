import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import {
  emitHookAdvice,
  emitHookBlock,
  emitHookPass,
  formatHookOutput,
  HookInputError,
  readHookInput,
} from "../lib/hookIO.js";

function streamFrom(payload: string | object): NodeJS.ReadableStream {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  return Readable.from([Buffer.from(text, "utf8")]);
}

describe("hookIO", () => {
  describe("readHookInput", () => {
    it("parses snake_case PostToolUse payloads", async () => {
      const input = await readHookInput({
        stream: streamFrom({
          session_id: "sess-1",
          cwd: "/repo",
          hook_event_name: "PostToolUse",
          tool_name: "Edit",
          tool_input: { file_path: "/repo/src/App.tsx" },
          tool_response: { ok: true },
        }),
      });

      expect(input).not.toBeNull();
      expect(input?.hookEventName).toBe("PostToolUse");
      expect(input?.toolName).toBe("Edit");
      expect(input?.toolInput).toEqual({ file_path: "/repo/src/App.tsx" });
      expect(input?.toolResponse).toEqual({ ok: true });
      expect(input?.sessionId).toBe("sess-1");
      expect(input?.hookCwd).toBe("/repo");
    });

    it("accepts camelCase top-level keys as forward-compat", async () => {
      const input = await readHookInput({
        stream: streamFrom({
          hookEventName: "PreToolUse",
          toolName: "Write",
          toolInput: { filePath: "/repo/src/Page.tsx" },
          sessionId: "sess-2",
        }),
      });

      expect(input?.hookEventName).toBe("PreToolUse");
      expect(input?.toolName).toBe("Write");
      expect(input?.toolInput).toEqual({ filePath: "/repo/src/Page.tsx" });
      expect(input?.sessionId).toBe("sess-2");
    });

    it("extracts edited file paths from Edit-style input", async () => {
      const input = await readHookInput({
        stream: streamFrom({
          hook_event_name: "PostToolUse",
          tool_name: "Edit",
          tool_input: { file_path: "/repo/src/App.tsx" },
        }),
      });
      expect(input?.editedFilePaths()).toEqual(["/repo/src/App.tsx"]);
    });

    it("extracts edited file paths from MultiEdit-style input", async () => {
      const input = await readHookInput({
        stream: streamFrom({
          hook_event_name: "PostToolUse",
          tool_name: "MultiEdit",
          tool_input: {
            edits: [
              { file_path: "/repo/src/A.tsx" },
              { file_path: "/repo/src/B.tsx" },
              { file_path: "/repo/src/A.tsx" }, // duplicate
            ],
          },
        }),
      });
      expect(input?.editedFilePaths()).toEqual([
        "/repo/src/A.tsx",
        "/repo/src/B.tsx",
      ]);
    });

    it("returns null when stdin is empty", async () => {
      const input = await readHookInput({ stream: Readable.from([]) });
      expect(input).toBeNull();
    });

    it("returns null when stdin is whitespace only", async () => {
      const input = await readHookInput({
        stream: streamFrom("   \n  \t  "),
      });
      expect(input).toBeNull();
    });

    it("throws HookInputError with code=invalid-json on malformed payloads", async () => {
      await expect(
        readHookInput({ stream: streamFrom("{not json}") }),
      ).rejects.toMatchObject({
        name: "HookInputError",
        code: "invalid-json",
      });
    });

    it("throws HookInputError with code=wrong-shape on non-object payloads", async () => {
      await expect(
        readHookInput({ stream: streamFrom("[1, 2, 3]") }),
      ).rejects.toMatchObject({
        name: "HookInputError",
        code: "wrong-shape",
      });
    });

    it("throws HookInputError with code=too-large when payload exceeds maxBytes", async () => {
      const big = "x".repeat(2048);
      await expect(
        readHookInput({ stream: streamFrom(big), maxBytes: 1024 }),
      ).rejects.toMatchObject({
        name: "HookInputError",
        code: "too-large",
      });
    });

    it("HookInputError is an Error instance", async () => {
      try {
        await readHookInput({ stream: streamFrom("not json") });
        throw new Error("expected throw");
      } catch (error) {
        expect(error).toBeInstanceOf(HookInputError);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it("returns empty array from editedFilePaths when tool_input is missing", async () => {
      const input = await readHookInput({
        stream: streamFrom({
          hook_event_name: "SessionStart",
        }),
      });
      expect(input?.editedFilePaths()).toEqual([]);
    });

    it("returns null when stream is reported as a TTY", async () => {
      const tty = Object.assign(Readable.from([]), { isTTY: true });
      const input = await readHookInput({ stream: tty });
      expect(input).toBeNull();
    });
  });

  describe("formatHookOutput", () => {
    it("serializes hookSpecificOutput with trailing newline", () => {
      const out = formatHookOutput({
        hookSpecificOutput: {
          hookEventName: "SessionStart",
          additionalContext: "hello",
        },
      });
      expect(out).toBe(
        `${JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "SessionStart",
            additionalContext: "hello",
          },
        })}\n`,
      );
    });

    it("drops undefined fields", () => {
      const out = formatHookOutput({
        continue: true,
        decision: undefined,
        reason: undefined,
      });
      expect(out).toBe(`${JSON.stringify({ continue: true })}\n`);
    });
  });

  describe("exit helpers", () => {
    it("emitHookBlock writes reason to stderr and returns 2", () => {
      const messages: string[] = [];
      const code = emitHookBlock("Salt review blocked 3 findings", {
        writeStderr: (message) => messages.push(message),
      });
      expect(code).toBe(2);
      expect(messages).toEqual(["Salt review blocked 3 findings\n"]);
    });

    it("emitHookBlock keeps reason newline if already present", () => {
      const messages: string[] = [];
      emitHookBlock("a\nb\n", {
        writeStderr: (message) => messages.push(message),
      });
      expect(messages).toEqual(["a\nb\n"]);
    });

    it("emitHookAdvice writes JSON to stdout and returns 0", () => {
      const messages: string[] = [];
      const code = emitHookAdvice(
        {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "ask",
            permissionDecisionReason: "matched scope=src/auth",
          },
        },
        { writeStdout: (message) => messages.push(message) },
      );
      expect(code).toBe(0);
      expect(messages).toHaveLength(1);
      const parsed = JSON.parse(messages[0]);
      expect(parsed.hookSpecificOutput.permissionDecision).toBe("ask");
    });

    it("emitHookPass returns 0 with no I/O", () => {
      const code = emitHookPass();
      expect(code).toBe(0);
    });
  });
});

import { spawn } from "node:child_process";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ProtocolError, parseRequest } from "../protocol";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(HERE, "..", "..", "bin", "salt-eval-grade.mjs");
const REPO_ROOT = path.resolve(HERE, "..", "..", "..", "..");

describe("parseRequest", () => {
  it("fills the default fixture and keeps checks in order", () => {
    const request = parseRequest({
      id: "r",
      files: { "src/A.tsx": "" },
      checks: [
        { id: "b", grader: "ts:typecheck" },
        { id: "a", grader: "lint:biome", params: { level: "warning" } },
      ],
    });
    expect(request).toEqual({
      id: "r",
      fixture: "workspace-vite-react",
      files: { "src/A.tsx": "" },
      checks: [
        { id: "b", grader: "ts:typecheck", params: {} },
        { id: "a", grader: "lint:biome", params: { level: "warning" } },
      ],
    });
  });

  it.each([
    [{ files: {}, checks: [] }, "request.id must be a non-empty string"],
    [
      { id: "r", files: { "../x.tsx": "" }, checks: [] },
      "request.files has an unsafe path: ../x.tsx",
    ],
    [
      { id: "r", files: { "/abs.tsx": "" }, checks: [] },
      "request.files has an unsafe path: /abs.tsx",
    ],
    [
      { id: "r", files: {}, checks: [{ id: "c", grader: "nope" }] },
      "request.checks[0].grader nope is not one of",
    ],
    [
      { id: "r", files: {}, checks: [], fixture: "../../etc" },
      "request.fixture must be a folder name",
    ],
  ])("rejects %j", (raw, message) => {
    expect(() => parseRequest(raw)).toThrow(ProtocolError);
    expect(() => parseRequest(raw)).toThrow(message);
  });
});

describe("--serve", () => {
  it("announces readiness, then answers one line per request and reports bad lines without dying", async () => {
    const child = spawn(
      process.execPath,
      [
        "--disable-warning=ExperimentalWarning",
        BIN,
        "--serve",
        "--repo",
        REPO_ROOT,
      ],
      { cwd: REPO_ROOT, stdio: ["pipe", "pipe", "pipe"] },
    );
    const lines = createInterface({ input: child.stdout });
    const replies: unknown[] = [];
    const done = new Promise<void>((resolve) => {
      lines.on("line", (line) => {
        replies.push(JSON.parse(line));
        if (replies.length === 4) resolve();
      });
    });
    const request = (id: string, files: Record<string, string>) =>
      JSON.stringify({
        id,
        files,
        checks: [
          {
            id: "absent",
            grader: "jsx:prop-absent",
            params: { element: "FormField", prop: "disabled" },
          },
        ],
      });
    child.stdin.write(
      `${request("one", { "src/A.tsx": 'import { FormField } from "@salt-ds/core";\nexport const A = () => <FormField disabled />;' })}\n`,
    );
    child.stdin.write("this is not json\n");
    child.stdin.write(
      `${JSON.stringify({ id: "bad", files: {}, checks: [{ id: "x", grader: "nope" }] })}\n`,
    );
    child.stdin.write(
      `${request("two", { "src/A.tsx": 'import { FormField } from "@salt-ds/core";\nexport const A = () => <FormField />;' })}\n`,
    );
    await done;
    child.stdin.end();
    await new Promise((resolve) => child.on("exit", resolve));

    expect(replies[0]).toMatchObject({ ready: true, protocol: 1 });
    expect(replies[1]).toMatchObject({
      id: "one",
      results: [{ id: "absent", verdict: "wrong" }],
    });
    expect(replies[2]).toMatchObject({
      id: "",
      error: expect.stringContaining("request is not valid JSON"),
    });
    expect(replies[3]).toMatchObject({
      id: "bad",
      error: expect.stringContaining("request.checks[0].grader nope"),
    });
    expect(child.exitCode).toBe(0);
  }, 30_000);
});

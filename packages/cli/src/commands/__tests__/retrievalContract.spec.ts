import { createHash } from "node:crypto";
import path from "node:path";
import { KnowledgeStore } from "@salt-ds/knowledge";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { runCliWithIo } from "../../cli.js";

const loadRetrievalRuntime = vi.hoisted(() => vi.fn());
vi.mock("../retrievalRuntime.js", () => ({
  loadRetrievalRuntime,
  renderRejectedProjectSelection: () => {
    throw new Error("This fixture has already selected its application.");
  },
}));

function captureIo() {
  let output = "";
  return {
    io: {
      cwd: () => "/selected-app",
      stdout: (value: string) => {
        output += value;
      },
    },
    output: () => output,
  };
}

// Independently reconstruct the documented canonical input. These contract
// fields contain finite JSON numbers and ordinary string-keyed objects.
function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, child]) => [key, canonicalValue(child)]),
    );
  }
  return value;
}

describe("CLI retrieval serialization with the generated Knowledge corpus", () => {
  let store: KnowledgeStore;
  let installedVersions: Record<string, string>;

  beforeAll(() => {
    store = new KnowledgeStore({
      bundleDir: path.resolve(
        import.meta.dirname,
        "../../../../knowledge/generated",
      ),
    });
    installedVersions = Object.fromEntries(
      store.manifest.compatibility.packages.map((entry) => [
        entry.name,
        entry.tested_version,
      ]),
    );
  });

  beforeEach(() => {
    loadRetrievalRuntime.mockResolvedValue({
      store,
      selection: { status: "selected" },
      installedVersions,
      inspectionLimitations: [],
    });
  });

  it("emits correctly counted and hashed JSON, then opens its first citation", async () => {
    const contextCapture = captureIo();
    await expect(
      runCliWithIo(
        [
          "context",
          "button navigation provider deprecated token",
          "--format",
          "json",
          "--limit",
          "100",
        ],
        contextCapture.io,
      ),
    ).resolves.toBe(0);
    const output = contextCapture.output();
    const result = JSON.parse(output);
    expect(output).toBe(`${JSON.stringify(result)}\n`);
    expect(Buffer.byteLength(output, "utf8")).toBeLessThanOrEqual(16 * 1024);
    expect(result.utf8_bytes).toBe(Buffer.byteLength(output, "utf8") - 1);

    const { context_digest, utf8_bytes: _count, ...digestInput } = result;
    expect(context_digest).toBe(
      `sha256:${createHash("sha256")
        .update(JSON.stringify(canonicalValue(digestInput)), "utf8")
        .digest("hex")}`,
    );
    const canonical = result.canonical_documents?.[0];
    const match = result.matches[0];
    const identifier = canonical?.reference ?? match?.citation.record_key;
    expect(identifier).toEqual(expect.any(String));
    const docsCapture = captureIo();
    await expect(
      runCliWithIo(["docs", identifier, "--format", "json"], docsCapture.io),
    ).resolves.toBe(0);
    expect(JSON.parse(docsCapture.output())).toMatchObject({
      status: "resolved",
      document: canonical
        ? { canonical: { reference: canonical.reference } }
        : { reference: match.reference },
    });
  });

  it.each(["json", "markdown"])(
    "rejects an oversized multibyte query without output for %s",
    async (format) => {
      const capture = captureIo();
      await expect(
        runCliWithIo(
          ["context", "é".repeat(12_000), "--format", format, "--limit", "5"],
          capture.io,
        ),
      ).rejects.toMatchObject({ code: "SALT_CLI_USAGE", exitCode: 2 });
      expect(capture.output()).toBe("");
    },
  );
});

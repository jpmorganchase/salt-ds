import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Published-schema shape audit.
//
// Catches the class of bug Tier 3 (a) closed (some schemas missing `$id`,
// some using a relative `$id`, some pointing at a fictional URL prefix).
// Asserts that every `*.schema.json` under `packages/semantic-core/schemas/`:
//
//   - declares `$schema` as the JSON Schema 2020-12 dialect URL,
//   - declares `$id` as an absolute http(s) URL (not relative, not missing),
//   - uses the same `$id` host that the rest of the schemas use, so a new
//     schema cannot silently land under a fresh URL prefix.
//
// This is a vendor-neutral structural audit — it does not assert the host
// is github.com (that's an editorial choice that lives in commit history).
// It only asserts that whatever host is in use is used consistently.

const SCHEMAS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "schemas",
);

const EXPECTED_SCHEMA_DIALECT =
  "https://json-schema.org/draft/2020-12/schema";

interface SchemaHeader {
  file: string;
  $schema: unknown;
  $id: unknown;
}

function loadSchemaHeaders(): SchemaHeader[] {
  return readdirSync(SCHEMAS_DIR)
    .filter((entry) => entry.endsWith(".schema.json"))
    .sort()
    .map((file) => {
      const raw = readFileSync(path.join(SCHEMAS_DIR, file), "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return { file, $schema: parsed.$schema, $id: parsed.$id };
    });
}

describe("published JSON schemas — header shape audit", () => {
  const headers = loadSchemaHeaders();

  it("enumerates the published JSON schema files (sanity check that the audit ran)", () => {
    expect(headers.length).toBeGreaterThan(0);
  });

  it("declares the JSON Schema 2020-12 dialect on every schema", () => {
    const offenders = headers.filter(
      (header) => header.$schema !== EXPECTED_SCHEMA_DIALECT,
    );
    expect(
      offenders,
      `Every published schema must declare \`"$schema": "${EXPECTED_SCHEMA_DIALECT}"\`. ` +
        `Offenders:\n${offenders
          .map((header) => `  - ${header.file}: ${JSON.stringify(header.$schema)}`)
          .join("\n")}`,
    ).toEqual([]);
  });

  it("declares an absolute http(s) `$id` on every schema", () => {
    const offenders = headers.filter((header) => {
      if (typeof header.$id !== "string") return true;
      try {
        const url = new URL(header.$id);
        return url.protocol !== "http:" && url.protocol !== "https:";
      } catch {
        return true;
      }
    });
    expect(
      offenders,
      `Every published schema must declare an absolute http(s) \`$id\`. ` +
        `Relative or missing \`$id\` values defeat the purpose of \`$id\` ` +
        `(uniquely identifying the schema across consumers). ` +
        `Offenders:\n${offenders
          .map((header) => `  - ${header.file}: ${JSON.stringify(header.$id)}`)
          .join("\n")}`,
    ).toEqual([]);
  });

  it("declares the same `$id` host across every schema", () => {
    const idsByHost = new Map<string, string[]>();
    for (const header of headers) {
      if (typeof header.$id !== "string") continue;
      let host: string;
      try {
        host = new URL(header.$id).host;
      } catch {
        continue;
      }
      const list = idsByHost.get(host) ?? [];
      list.push(header.file);
      idsByHost.set(host, list);
    }
    const hosts = Array.from(idsByHost.keys()).sort();
    expect(
      hosts.length,
      `All published schemas must share the same \`$id\` host so a new ` +
        `schema cannot silently land under a fresh URL prefix. Found ` +
        `${hosts.length} distinct host(s):\n${hosts
          .map(
            (host) =>
              `  - ${host}: ${idsByHost.get(host)?.length ?? 0} schema(s)`,
          )
          .join("\n")}`,
    ).toBe(1);
  });

  it("declares an `$id` whose basename matches the file name", () => {
    const offenders = headers.filter((header) => {
      if (typeof header.$id !== "string") return false;
      let basename: string;
      try {
        basename = path.basename(new URL(header.$id).pathname);
      } catch {
        return false;
      }
      return basename !== header.file;
    });
    expect(
      offenders,
      `Every published schema's \`$id\` basename must match its file name ` +
        `so renames stay consistent. Offenders:\n${offenders
          .map((header) => `  - ${header.file}: ${JSON.stringify(header.$id)}`)
          .join("\n")}`,
    ).toEqual([]);
  });
});

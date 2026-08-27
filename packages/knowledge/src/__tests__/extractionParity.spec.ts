import { readFileSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  createExtractionParityProjection,
  createExtractionParityReceipt,
} from "../build/extractionParity.js";
import { REPO_ROOT } from "./registryTestUtils.js";

type Characterization = Awaited<
  ReturnType<typeof createExtractionParityProjection>
>;

const baselinePath = path.join(
  REPO_ROOT,
  "packages",
  "knowledge",
  "src",
  "__fixtures__",
  "unit01-semantic-characterization.json",
);
const baselineBytes = readFileSync(baselinePath);
const baseline = JSON.parse(
  baselineBytes.toString("utf8"),
) as Characterization;
const baselineSource = {
  path: "packages/knowledge/src/__fixtures__/unit01-semantic-characterization.json",
  sha256:
    "sha256:0e7f974cc1baed2d57ee58e7570eb2a7c247f40749b4b6f54ed46d4da6801be7",
  bytes: baselineBytes.byteLength,
};

function changed(
  mutate: (value: Record<string, any>) => void,
): Characterization {
  const value = structuredClone(baseline) as unknown as Record<string, any>;
  mutate(value);
  return value as unknown as Characterization;
}

describe("Unit 02 extraction parity receipt", () => {
  it("validates the generated deterministic receipt against its public schema", () => {
    const schema = JSON.parse(
      readFileSync(
        path.join(
          REPO_ROOT,
          "scripts",
          "schemas",
          "saltExtractionParityV1.schema.json",
        ),
        "utf8",
      ),
    );
    const receipt = JSON.parse(
      readFileSync(
        path.join(
          REPO_ROOT,
          "packages",
          "knowledge",
          "generated",
          "extraction-parity.json",
        ),
        "utf8",
      ),
    );
    const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
      schema,
    );

    expect(validate(receipt), JSON.stringify(validate.errors)).toBe(true);
    expect(receipt.status).toBe("passed");
    expect(receipt.comparisons.map(({ domain }: { domain: string }) => domain))
      .toEqual([
        "records",
        "package_facts",
        "queries",
        "findings",
        "applicability",
        "integrity",
      ]);
  });

  it.each([
    [
      "records",
      (value: Record<string, any>) => {
        value.catalog.record_reads[0].status = "changed";
      },
    ],
    [
      "package_facts",
      (value: Record<string, any>) => {
        value.project_facts.package_manifest.name = "changed";
      },
    ],
    [
      "queries",
      (value: Record<string, any>) => {
        value.search.query = "changed";
      },
    ],
    [
      "findings",
      (value: Record<string, any>) => {
        value.review.complete_result_fields = ["changed"];
      },
    ],
    [
      "applicability",
      (value: Record<string, any>) => {
        value.applicability.exact.state = "unknown";
      },
    ],
    [
      "integrity",
      (value: Record<string, any>) => {
        value.integrity.digest_mismatch = "accepted";
      },
    ],
  ])("fails closed when %s meaning changes", (domain, mutate) => {
    expect(() =>
      createExtractionParityReceipt({
        baseline,
        baselineSource,
        current: changed(mutate),
      }),
    ).toThrow(`Extraction parity failed for ${domain}`);
  });
});

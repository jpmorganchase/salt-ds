import { describe, expect, it } from "vitest";
import {
  decodeProjectPolicyRootToken,
  projectPolicyResourceTemplate,
  projectPolicyResourceUri,
  projectPolicyRootToken,
} from "../projectPolicyResourceIdentity.js";

describe("project-policy resource identity", () => {
  it("round-trips canonical Windows and Unicode roots without exposing separators", () => {
    const rootDir = "C:\\work\\設計 system\\repo";
    const token = projectPolicyRootToken(rootDir);

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(token).not.toMatch(/[\\/:]/u);
    expect(decodeProjectPolicyRootToken(token)).toBe(rootDir);
    expect(decodeProjectPolicyRootToken(`${token}=`)).toBeNull();
  });

  it("creates exact digest-bound manifest and encoded claim identities", () => {
    const digest = `sha256:${"a".repeat(64)}`;
    const rootDir = "D:\\repo";

    expect(
      projectPolicyResourceUri({ rootDir, digest, kind: "manifest" }),
    ).toBe(
      `salt://project-policy/v2/${projectPolicyRootToken(rootDir)}/sha256-${"a".repeat(64)}/manifest/index`,
    );
    expect(
      projectPolicyResourceUri({
        rootDir,
        digest,
        kind: "claim",
        id: "claim/with spaces",
      }),
    ).toMatch(/\/claim\/claim%2Fwith%20spaces$/u);
    expect(projectPolicyResourceTemplate()).toBe(
      "salt://project-policy/v2/{root}/{digest}/{kind}/{id}",
    );
  });

  it("rejects malformed digests and missing non-manifest ids", () => {
    expect(() =>
      projectPolicyResourceUri({
        rootDir: "D:\\repo",
        digest: "sha256:not-a-digest",
        kind: "manifest",
      }),
    ).toThrow(/Invalid project-policy digest/u);
    expect(() =>
      projectPolicyResourceUri({
        rootDir: "D:\\repo",
        digest: `sha256:${"a".repeat(64)}`,
        kind: "chunk",
      }),
    ).toThrow(/require an id/u);
    expect(() =>
      projectPolicyResourceUri({
        rootDir: "D:\\repo",
        digest: `sha256:${"a".repeat(64)}`,
        kind: "claim",
        id: "x".repeat(257),
      }),
    ).toThrow(/cannot exceed 256 characters/u);
  });

  it("round-trips the maximum multibyte public path input", () => {
    const rootDir = "設".repeat(4_096);
    const token = projectPolicyRootToken(rootDir);

    expect(token.length).toBeGreaterThan(8_192);
    expect(decodeProjectPolicyRootToken(token)).toBe(rootDir);
    expect(() => projectPolicyRootToken("設".repeat(10_000))).toThrow(
      /root tokens cannot exceed/iu,
    );
  });
});

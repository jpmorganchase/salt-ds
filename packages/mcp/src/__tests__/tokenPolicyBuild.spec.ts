import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getToken, recommendTokens } from "@salt-ds/semantic-core";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { getTokenPolicy } from "@salt-ds/semantic-core/build/buildRegistryTokenPolicy";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { REPO_ROOT } from "./registryTestUtils.js";

const DESIGN_TOKENS_URL = "/salt/themes/design-tokens/index";
let outputDir = "";
let builtRegistry: Awaited<ReturnType<typeof buildRegistry>>;
let builtTokensArtifact: {
  tokens: Array<{
    name: string;
    policy?: {
      docs?: string[] | null;
      structural_roles?: string[] | null;
      pairing?: {
        family: string;
        role: string;
        level?: string | null;
      } | null;
    } | null;
  }>;
};

beforeAll(async () => {
  outputDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "salt-token-policy-build-"),
  );
  builtRegistry = await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir,
    timestamp: "2026-03-26T00:00:00Z",
  });
  builtTokensArtifact = JSON.parse(
    fs.readFileSync(path.join(outputDir, "tokens.json"), "utf8"),
  ) as typeof builtTokensArtifact;
}, 40000);

afterAll(() => {
  if (outputDir) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

describe("generated token policy", () => {
  it("uses the real design token docs instead of defaulting every palette token to the summary route", () => {
    const policy = getTokenPolicy({
      name: "--salt-palette-accent-border",
      category: "palette",
    });

    expect(policy).toMatchObject({
      usage_tier: "palette",
      direct_component_use: "never",
      docs: [DESIGN_TOKENS_URL],
    });
  });

  it("prefers the specific characteristic doc for characteristic tokens", () => {
    const policy = getTokenPolicy({
      name: "--salt-container-primary-background",
      category: "container",
    });

    expect(policy?.docs).toEqual([
      "/salt/themes/design-tokens/container-characteristic",
      DESIGN_TOKENS_URL,
    ]);
    expect(policy?.structural_roles).toEqual(["container-background"]);
    expect(policy?.pairing).toEqual({
      family: "container",
      role: "container-background",
      level: "primary",
    });
  });

  it("prefers the specific foundation doc for foundation tokens", () => {
    const policy = getTokenPolicy({
      name: "--salt-size-fixed-100",
      category: "size",
    });

    expect(policy?.docs).toEqual(["/salt/foundations/size", DESIGN_TOKENS_URL]);
    expect(policy?.structural_roles).toEqual([
      "border-thickness",
      "separator-thickness",
    ]);
  });

  it("encodes default border style roles from the foundation docs", () => {
    const policy = getTokenPolicy({
      name: "--salt-borderStyle-solid",
      category: "borderstyle",
    });

    expect(policy?.docs).toEqual([
      "/salt/foundations/borderStyle",
      DESIGN_TOKENS_URL,
    ]);
    expect(policy?.structural_roles).toEqual([
      "border-style-default",
      "separator-style-default",
    ]);
  });

  it("encodes separator roles from the separable characteristic docs", () => {
    const policy = getTokenPolicy({
      name: "--salt-separable-secondary-borderColor",
      category: "separable",
    });

    expect(policy?.docs).toEqual([
      "/salt/themes/design-tokens/separable-characteristic",
      DESIGN_TOKENS_URL,
    ]);
    expect(policy?.structural_roles).toEqual(["separator-color"]);
  });

  it("keeps the generated token artifact aligned with the specific docs", () => {
    const accentToken = builtTokensArtifact.tokens.find(
      (token) => token.name === "--salt-accent-background",
    );
    const containerToken = builtTokensArtifact.tokens.find(
      (token) => token.name === "--salt-container-primary-background",
    );
    const paletteToken = builtTokensArtifact.tokens.find(
      (token) => token.name === "--salt-palette-accent-border",
    );

    expect(accentToken?.policy?.docs).toEqual([
      "/salt/themes/design-tokens/brand",
      DESIGN_TOKENS_URL,
    ]);
    expect(containerToken?.policy?.structural_roles).toEqual([
      "container-background",
    ]);
    expect(containerToken?.policy?.pairing).toEqual({
      family: "container",
      role: "container-background",
      level: "primary",
    });
    expect(paletteToken?.policy?.docs).toEqual([DESIGN_TOKENS_URL]);
  });

  it("keeps buildRegistry output aligned with the specific docs", () => {
    const accentToken = builtRegistry.tokens.find(
      (token) => token.name === "--salt-accent-background",
    );
    const containerToken = builtRegistry.tokens.find(
      (token) => token.name === "--salt-container-primary-background",
    );
    const paletteToken = builtRegistry.tokens.find(
      (token) => token.name === "--salt-palette-accent-border",
    );

    expect(accentToken?.policy?.docs).toEqual([
      "/salt/themes/design-tokens/brand",
      DESIGN_TOKENS_URL,
    ]);
    expect(containerToken?.policy?.structural_roles).toEqual([
      "container-background",
    ]);
    expect(containerToken?.policy?.pairing).toEqual({
      family: "container",
      role: "container-background",
      level: "primary",
    });
    expect(paletteToken?.policy?.docs).toEqual([DESIGN_TOKENS_URL]);
  });
});

describe("token tools", () => {
  const registry: SaltRegistry = {
    generated_at: "2026-03-26T00:00:00Z",
    version: "1.0.0",
    build_info: null,
    packages: [],
    components: [],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [
      {
        name: "--salt-size-fixed-100",
        category: "size",
        type: "dimension",
        value: "1px",
        semantic_intent: "Fixed border and separator thickness.",
        themes: ["salt", "next"],
        densities: [],
        applies_to: [],
        guidance: ["Use for border and separator thickness."],
        aliases: [],
        policy: {
          usage_tier: "foundation",
          direct_component_use: "conditional",
          preferred_for: ["border thickness"],
          avoid_for: ["semantic component styling"],
          notes: [
            "Fixed size tokens are the correct choice for border thickness.",
          ],
          docs: ["/salt/foundations/size", DESIGN_TOKENS_URL],
        },
        deprecated: false,
        last_verified_at: "2026-03-26T00:00:00Z",
      },
    ],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
  };

  it("does not reintroduce the summary route in getToken output when policy docs omit it", () => {
    const result = getToken(registry, {
      name: "--salt-size-fixed-100",
      max_results: 1,
    });

    expect(result.tokens[0]).toMatchObject({
      docs: [DESIGN_TOKENS_URL, "/salt/foundations/size"],
    });
  });

  it("does not reintroduce the summary route in recommendTokens output when policy docs omit it", () => {
    const result = recommendTokens(registry, {
      query: "border thickness",
      category: "size",
      top_k: 1,
    });

    expect(result.recommended).toMatchObject({
      docs: [DESIGN_TOKENS_URL, "/salt/foundations/size"],
    });
  });
});

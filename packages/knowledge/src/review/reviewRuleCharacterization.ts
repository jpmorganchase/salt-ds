export type ReviewCharacterizationLanguage = "tsx" | "css";

export interface ReviewCharacterizationArtifact {
  id: string;
  language: ReviewCharacterizationLanguage;
  text: string;
  target: string;
}

export interface ReviewRuleCharacterization {
  rule_id: string;
  rule_description: string;
  disposition: "enabled" | "dormant_source_unavailable";
  expected_parser: "babel" | "postcss";
  expected_severity: "warning";
  package_names: readonly string[];
  positive: ReviewCharacterizationArtifact;
  correct: ReviewCharacterizationArtifact;
  unsupported: ReviewCharacterizationArtifact & {
    expectation: "no_finding" | "skipped_unknown";
    package_versions?: Readonly<Record<string, string>>;
  };
  repair_family:
    | "interaction_semantics"
    | "symbol_migration"
    | "prop_migration"
    | null;
  golden_repair: ReviewCharacterizationArtifact | null;
  acceptance_check: string;
  limitations: string;
}

export const REVIEW_RULE_DESCRIPTORS = [
  {
    rule_id: "salt.component.action_navigation_target",
    description:
      "Salt action components must not be used as navigation links with a statically known destination.",
  },
  {
    rule_id: "salt.catalog.non_stable_import",
    description:
      "A used Salt value import is checked against its canonical catalog status.",
  },
  {
    rule_id: "salt.deprecation.used_import",
    description:
      "A used Salt value import is checked against source-bound deprecation records.",
  },
  {
    rule_id: "salt.deprecation.static_prop",
    description:
      "A statically named prop on a used Salt component is checked against source-bound deprecation records.",
  },
  {
    rule_id: "salt.token.deprecated_identity",
    description:
      "A parsed Salt custom-property reference is checked against canonical token deprecation state.",
  },
] as const;

export const REVIEW_RULE_CHARACTERIZATION = [
  {
    rule_id: REVIEW_RULE_DESCRIPTORS[0].rule_id,
    rule_description: REVIEW_RULE_DESCRIPTORS[0].description,
    disposition: "enabled",
    expected_parser: "babel",
    expected_severity: "warning",
    package_names: ["@salt-ds/core"],
    positive: {
      id: "action-navigation-positive.tsx",
      language: "tsx",
      text: 'import { Button } from "@salt-ds/core";\nexport const Demo = () => <Button href="/next">Next</Button>;',
      target: 'href="/next"',
    },
    correct: {
      id: "action-navigation-correct.tsx",
      language: "tsx",
      text: 'import { Link } from "@salt-ds/core";\nexport const Demo = () => <Link href="/next">Next</Link>;',
      target: 'href="/next"',
    },
    unsupported: {
      id: "action-navigation-dynamic.tsx",
      language: "tsx",
      text: 'import { Button } from "@salt-ds/core";\nconst destination = "/next";\nexport const Demo = () => <Button href={destination}>Next</Button>;',
      target: "href={destination}",
      expectation: "no_finding",
    },
    repair_family: "interaction_semantics",
    golden_repair: {
      id: "action-navigation-repair.tsx",
      language: "tsx",
      text: 'import { Link } from "@salt-ds/core";\nexport const Demo = () => <Link href="/next">Next</Link>;',
      target: 'href="/next"',
    },
    acceptance_check:
      "A static Button navigation target emits one source-bound warning at the exact UTF-8 byte range; dynamic targets remain outside evaluated scope.",
    limitations:
      "Only source-characterized action components and statically known non-empty navigation targets are evaluated.",
  },
  {
    rule_id: REVIEW_RULE_DESCRIPTORS[1].rule_id,
    rule_description: REVIEW_RULE_DESCRIPTORS[1].description,
    disposition: "enabled",
    expected_parser: "babel",
    expected_severity: "warning",
    package_names: ["@salt-ds/lab", "@salt-ds/core"],
    positive: {
      id: "catalog-status-positive.tsx",
      language: "tsx",
      text: 'import { LinkButton } from "@salt-ds/lab";\nexport const Demo = () => <LinkButton href="/next">Next</LinkButton>;',
      target: "LinkButton",
    },
    correct: {
      id: "catalog-status-correct.tsx",
      language: "tsx",
      text: 'import { Button } from "@salt-ds/core";\nexport const Demo = () => <Button>Next</Button>;',
      target: "Button",
    },
    unsupported: {
      id: "catalog-status-unused.tsx",
      language: "tsx",
      text: 'import { LinkButton } from "@salt-ds/lab";\nexport const value = 1;',
      target: "LinkButton",
      expectation: "no_finding",
    },
    repair_family: null,
    golden_repair: null,
    acceptance_check:
      "A used current-catalog lab component emits one source-bound warning; an unused import does not.",
    limitations:
      "The rule reports catalog maturity but does not invent a stable replacement when Knowledge has no exact replacement assertion.",
  },
  {
    rule_id: REVIEW_RULE_DESCRIPTORS[2].rule_id,
    rule_description: REVIEW_RULE_DESCRIPTORS[2].description,
    disposition: "enabled",
    expected_parser: "babel",
    expected_severity: "warning",
    package_names: ["@salt-ds/icons"],
    positive: {
      id: "deprecated-import-positive.tsx",
      language: "tsx",
      text: 'import { LineChartIcon } from "@salt-ds/icons";\nexport const Demo = () => <LineChartIcon />;',
      target: "LineChartIcon",
    },
    correct: {
      id: "deprecated-import-correct.tsx",
      language: "tsx",
      text: 'import { ChartLineIcon } from "@salt-ds/icons";\nexport const Demo = () => <ChartLineIcon />;',
      target: "ChartLineIcon",
    },
    unsupported: {
      id: "deprecated-import-unresolved-version.tsx",
      language: "tsx",
      text: 'import { LineChartIcon } from "@salt-ds/icons";\nexport const Demo = () => <LineChartIcon />;',
      target: "LineChartIcon",
      expectation: "skipped_unknown",
      package_versions: { "@salt-ds/icons": "workspace:*" },
    },
    repair_family: "symbol_migration",
    golden_repair: {
      id: "deprecated-import-repair.tsx",
      language: "tsx",
      text: 'import { ChartLineIcon } from "@salt-ds/icons";\nexport const Demo = () => <ChartLineIcon />;',
      target: "ChartLineIcon",
    },
    acceptance_check:
      "The exact deprecated import emits one source-bound warning with its canonical replacement; unresolved version evidence is explicitly skipped unknown.",
    limitations:
      "Only used value imports with exact source identities and applicable deprecation metadata are evaluated.",
  },
  {
    rule_id: REVIEW_RULE_DESCRIPTORS[3].rule_id,
    rule_description: REVIEW_RULE_DESCRIPTORS[3].description,
    disposition: "enabled",
    expected_parser: "babel",
    expected_severity: "warning",
    package_names: ["@salt-ds/core"],
    positive: {
      id: "deprecated-prop-positive.tsx",
      language: "tsx",
      text: 'import { Text } from "@salt-ds/core";\nexport const Demo = () => <Text variant="primary">Text</Text>;',
      target: 'variant="primary"',
    },
    correct: {
      id: "deprecated-prop-correct.tsx",
      language: "tsx",
      text: 'import { Text } from "@salt-ds/core";\nexport const Demo = () => <Text color="primary">Text</Text>;',
      target: 'color="primary"',
    },
    unsupported: {
      id: "deprecated-prop-spread.tsx",
      language: "tsx",
      text: 'import { Text } from "@salt-ds/core";\nconst props = { variant: "primary" };\nexport const Demo = () => <Text {...props}>Text</Text>;',
      target: "{...props}",
      expectation: "no_finding",
    },
    repair_family: "prop_migration",
    golden_repair: {
      id: "deprecated-prop-repair.tsx",
      language: "tsx",
      text: 'import { Text } from "@salt-ds/core";\nexport const Demo = () => <Text color="primary">Text</Text>;',
      target: 'color="primary"',
    },
    acceptance_check:
      "The exact deprecated Text prop emits one source-bound warning with its canonical replacement; spread props remain outside evaluated scope.",
    limitations:
      "Only statically named props on unambiguously resolved Salt component identities are evaluated.",
  },
  {
    rule_id: REVIEW_RULE_DESCRIPTORS[4].rule_id,
    rule_description: REVIEW_RULE_DESCRIPTORS[4].description,
    disposition: "enabled",
    expected_parser: "postcss",
    expected_severity: "warning",
    package_names: [],
    positive: {
      id: "deprecated-token-positive.css",
      language: "css",
      text: ".fixture { color: var(--salt-accent-background); }",
      target: "--salt-accent-background",
    },
    correct: {
      id: "deprecated-token-correct.css",
      language: "css",
      text: ".fixture { color: var(--salt-text-link-foreground-disabled); }",
      target: "--salt-text-link-foreground-disabled",
    },
    unsupported: {
      id: "deprecated-token-unknown.css",
      language: "css",
      text: ".fixture { color: var(--consumer-owned-token); }",
      target: "--consumer-owned-token",
      expectation: "no_finding",
    },
    repair_family: null,
    golden_repair: null,
    acceptance_check:
      "The exact deprecated token identity emits one source-bound warning; consumer-owned token identities do not.",
    limitations:
      "The rule reports canonical deprecated declarations but does not infer a replacement without an exact source-bound replacement assertion.",
  },
] as const satisfies readonly (ReviewRuleCharacterization & {
  rule_id: (typeof REVIEW_RULE_DESCRIPTORS)[number]["rule_id"];
})[];

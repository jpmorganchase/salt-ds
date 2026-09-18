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

export const REVIEW_RULE_CHARACTERIZATION = REVIEW_RULE_DESCRIPTORS.map(
  (rule) => ({
    rule_id: rule.rule_id,
    rule_description: rule.description,
  }),
);

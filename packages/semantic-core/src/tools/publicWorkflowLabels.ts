const PUBLIC_WORKFLOW_LABELS = {
  analyze_salt_code: "review_changed_code",
  choose_salt_solution: "refine_recommendation",
  compare_salt_versions: "review_upgrade_impact",
  discover_salt: "broaden_discovery",
  get_salt_entity: "ground_with_entity_details",
  get_salt_examples: "ground_with_examples",
  translate_ui_to_salt: "refine_migration_mapping",
} as const;

export type InternalWorkflowLabel = keyof typeof PUBLIC_WORKFLOW_LABELS;

export function toPublicWorkflowLabel(label: string): string {
  return PUBLIC_WORKFLOW_LABELS[label as InternalWorkflowLabel] ?? label;
}

export function replaceInternalWorkflowLabels(text: string): string {
  let sanitized = text;

  for (const [internalName, publicLabel] of Object.entries(
    PUBLIC_WORKFLOW_LABELS,
  )) {
    sanitized = sanitized.split(internalName).join(publicLabel);
  }

  return sanitized;
}

export { PUBLIC_WORKFLOW_LABELS };

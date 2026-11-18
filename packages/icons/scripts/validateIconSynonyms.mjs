export function validateIconSynonyms(deprecatedIcons, iconSynonyms) {
  const conflicts = iconSynonyms.flatMap(({ iconName }) => {
    // Match the icon browser, where one synonym entry can cover both variants.
    const pattern = new RegExp(`^${iconName.replace(/-/g, "")}(Solid)?$`, "i");

    return deprecatedIcons
      .filter(({ componentName }) => pattern.test(componentName))
      .map(({ componentName }) => `- ${iconName} (${componentName}Icon)`);
  });

  if (conflicts.length > 0) {
    throw new Error(
      [
        "Deprecated icons must not have entries in site/src/components/icon-preview/salt-icon-synonym.json.",
        ...conflicts,
        "Remove the complete entries and their rows in the Icons Synonym List spreadsheet.",
      ].join("\n"),
    );
  }
}

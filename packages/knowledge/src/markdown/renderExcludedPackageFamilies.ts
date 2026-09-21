import { renderUntrustedMarkdownEvidence } from "./untrustedMarkdown.js";

/** These are catalog exclusions, not a list of dependencies to install. */
export function renderExcludedPackageFamilies(
  families: readonly {
    name: string;
    state: string;
    observed_version: string | null;
    supported_range: string;
  }[],
): string {
  if (families.length === 0) return "";
  return `\n## Excluded package families\n\n${families
    .map(
      (entry) =>
        `- ${renderUntrustedMarkdownEvidence(entry.name, { mode: "inline" })}: ${renderUntrustedMarkdownEvidence(entry.state, { mode: "inline" })}; observed ${renderUntrustedMarkdownEvidence(entry.observed_version ?? "not installed", { mode: "inline" })}; supported ${renderUntrustedMarkdownEvidence(entry.supported_range, { mode: "inline" })}`,
    )
    .join("\n")}\n`;
}

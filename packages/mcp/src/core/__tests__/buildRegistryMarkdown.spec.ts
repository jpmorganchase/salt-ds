import { describe, expect, it } from "vitest";
import {
  extractStatementsFromSection,
  parseSectionStatements,
} from "../build/buildRegistryMarkdown.js";

// All Salt-looking strings in this file are intentionally tiny fixture facts.

describe("build registry markdown extraction", () => {
  it("keeps fixture subsection statements inside the requested section", () => {
    const content = `
## Fixture build

### Fixture anatomy

Build the fixture surface from documented fixture regions.

- Keep the fixture action close to its source-backed label.

### Fixture layout

Use fixture spacing only when fixture evidence provides it.

## Fixture next section

This statement belongs to a different fixture section.
`;

    expect(parseSectionStatements(content, "Fixture build")).toEqual([
      "Build the fixture surface from documented fixture regions.",
      "Keep the fixture action close to its source-backed label.",
      "Use fixture spacing only when fixture evidence provides it.",
    ]);
  });

  it("extracts the documented fixture sentence before an example lead-in", () => {
    const content = `
Improve fixture accessibility with documented fixture context. For example:

\`\`\`jsx
<FixtureAction />
\`\`\`
`;

    expect(extractStatementsFromSection(content)).toEqual([
      "Improve fixture accessibility with documented fixture context.",
    ]);
  });
});

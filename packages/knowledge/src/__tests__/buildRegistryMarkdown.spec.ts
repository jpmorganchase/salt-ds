import { describe, expect, it } from "vitest";
import { parseStructuredGuidanceCallouts } from "../build/buildRegistryMarkdown.js";

describe("parseStructuredGuidanceCallouts", () => {
  it("extracts preferred and avoid guidance only from explicitly structured callouts", () => {
    const content = `
<Callout guidance="preferred">

- Prefer \`VerticalNavigation\` for structured app navigation.

</Callout>

<GuidanceCallout type="negative">

- Do not use a single destination link for multi-level navigation.

</GuidanceCallout>

<Callout title="Quick check">

- This should not be classified because it has no explicit guidance signal.

</Callout>
`;

    const result = parseStructuredGuidanceCallouts(content);

    expect(result.preferred).toEqual([
      "Prefer VerticalNavigation for structured app navigation.",
    ]);
    expect(result.avoid).toEqual([
      "Do not use a single destination link for multi-level navigation.",
    ]);
  });
});

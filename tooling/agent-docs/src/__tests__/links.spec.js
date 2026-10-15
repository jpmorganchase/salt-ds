import { describe, expect, it } from "vitest";
import { createLinkResolver, docLink, relativeDocLink } from "../links.mjs";

const routeIndex = new Map([
  [
    "/salt/components/button",
    { packageName: "@salt-ds/core", docPath: "components/button.md" },
  ],
  [
    "/salt/components/dialog",
    { packageName: "@salt-ds/core", docPath: "components/dialog.md" },
  ],
  [
    "/salt/patterns/forms",
    { packageName: "@salt-ds/core", docPath: "patterns/forms.md" },
  ],
  [
    "/salt/foundations/spacing",
    { packageName: "@salt-ds/theme", docPath: "foundations/spacing.md" },
  ],
]);

const fromButtonUsage = {
  sitePath: "/salt/components/button/usage",
  packageName: "@salt-ds/core",
  docPath: "components/button.md",
};

describe("createLinkResolver", () => {
  const { resolve } = createLinkResolver(routeIndex);

  it("resolves relative links from the page's site URL", () => {
    expect(resolve("../dialog", fromButtonUsage)).toBe("./dialog.md");
  });

  it("links across sections of the same package", () => {
    expect(resolve("/salt/patterns/forms", fromButtonUsage)).toBe(
      "../patterns/forms.md",
    );
  });

  it("qualifies links to other packages", () => {
    expect(resolve("/salt/foundations/spacing#tokens", fromButtonUsage)).toBe(
      "@salt-ds/theme/docs/foundations/spacing.md#tokens",
    );
  });

  it("maps component tab routes and index routes to the component file", () => {
    expect(
      resolve("/salt/components/dialog/examples#focus", fromButtonUsage),
    ).toBe("./dialog.md#focus");
    expect(resolve("/salt/components/dialog/index", fromButtonUsage)).toBe(
      "./dialog.md",
    );
  });

  it("resolves links on index pages relative to their /index URL", () => {
    expect(
      resolve("../patterns/forms", {
        sitePath: "/salt/components/index",
        packageName: "@salt-ds/core",
        docPath: "components.md",
      }),
    ).toBe("./patterns/forms.md");
  });

  it("points unknown routes at the website and keeps external links", () => {
    expect(resolve("/salt/about/roadmap", fromButtonUsage)).toBe(
      "https://www.saltdesignsystem.com/salt/about/roadmap",
    );
    expect(resolve("https://example.com/x", fromButtonUsage)).toBe(
      "https://example.com/x",
    );
    expect(resolve("#props", fromButtonUsage)).toBe("#props");
  });

  it("drops links to site assets", () => {
    expect(resolve("/img/diagram.png", fromButtonUsage)).toBeNull();
  });
});

describe("docLink", () => {
  it("uses relative paths within a package", () => {
    expect(
      relativeDocLink("components/button.md", "components/dialog.md"),
    ).toBe("./dialog.md");
    expect(
      docLink({
        fromPackage: "@salt-ds/core",
        fromDocPath: "index.md",
        toPackage: "@salt-ds/theme",
        toDocPath: "tokens.md",
      }),
    ).toBe("@salt-ds/theme/docs/tokens.md");
  });
});

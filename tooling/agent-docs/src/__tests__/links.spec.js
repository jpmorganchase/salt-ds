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

  it("drops relative links to site assets but keeps absolute ones", () => {
    expect(resolve("/img/diagram.png", fromButtonUsage)).toBeNull();
    expect(
      resolve(
        "https://www.saltdesignsystem.com/files/salt-icons.zip",
        fromButtonUsage,
      ),
    ).toBe("https://www.saltdesignsystem.com/files/salt-icons.zip");
  });

  it("resolves absolute website links to shipped pages", () => {
    expect(
      resolve(
        "https://www.saltdesignsystem.com/salt/patterns/forms#layout",
        fromButtonUsage,
      ),
    ).toBe("../patterns/forms.md#layout");
    expect(
      resolve(
        "https://www.saltdesignsystem.com/salt/components/dialog/examples",
        fromButtonUsage,
      ),
    ).toBe("./dialog.md");
    expect(
      resolve(
        "https://www.saltdesignsystem.com/salt/about/roadmap",
        fromButtonUsage,
      ),
    ).toBe("https://www.saltdesignsystem.com/salt/about/roadmap");
  });
});

describe("createLinkResolver with site routes", () => {
  const siteRoutes = new Set([
    ...routeIndex.keys(),
    "/salt/components/button/usage",
    "/salt/about/roadmap",
  ]);
  const { resolve } = createLinkResolver(routeIndex, { siteRoutes });
  const withErrors = () => {
    const errors = [];
    return {
      errors,
      ctx: {
        ...fromButtonUsage,
        error: (node, message) => errors.push({ node, message }),
      },
    };
  };

  it("points unshipped site pages at the website without an error", () => {
    const { errors, ctx } = withErrors();
    expect(resolve("/salt/about/roadmap", ctx)).toBe(
      "https://www.saltdesignsystem.com/salt/about/roadmap",
    );
    expect(resolve("/salt/components/button/usage", ctx)).toBe("./button.md");
    expect(errors).toEqual([]);
  });

  it("reports links to routes the site doesn't have, suggesting a different case", () => {
    const { errors, ctx } = withErrors();
    const node = { type: "link" };
    resolve("../Dialog", ctx, node);
    resolve("/salt/components/missing", ctx, node);
    resolve(
      "https://www.saltdesignsystem.com/salt/patterns/Forms/examples",
      ctx,
      node,
    );
    expect(errors).toEqual([
      {
        node,
        message:
          "Link ../Dialog points to /salt/components/Dialog, which is not a page on the site. Did you mean /salt/components/dialog?",
      },
      {
        node,
        message:
          "Link /salt/components/missing points to /salt/components/missing, which is not a page on the site.",
      },
      {
        node,
        message:
          "Link https://www.saltdesignsystem.com/salt/patterns/Forms/examples points to /salt/patterns/Forms/examples, which is not a page on the site. Did you mean /salt/patterns/forms?",
      },
    ]);
  });

  it("leaves links outside the documentation alone", () => {
    const { errors, ctx } = withErrors();
    expect(resolve("/blog/post", ctx)).toBe(
      "https://www.saltdesignsystem.com/blog/post",
    );
    expect(resolve("https://example.com/salt/x", ctx)).toBe(
      "https://example.com/salt/x",
    );
    expect(errors).toEqual([]);
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

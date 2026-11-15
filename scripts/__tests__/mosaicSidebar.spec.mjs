import { describe, expect, it } from "vitest";
import SidebarPlugin from "../../site/src/mosaic-plugins/SidebarPlugin.mjs";

const header = { homeLink: "/salt/index", searchNamespace: "salt", menu: [] };

async function generateSidebar() {
  const pages = [
    {
      fullPath: "/salt/index.mdx",
      route: "/salt/index",
      title: "Salt",
      sharedConfig: { header },
      content: "# Salt",
    },
    {
      fullPath: "/salt/components/index.mdx",
      route: "/salt/components/index",
      title: "Components",
      sidebar: {
        label: "Overview",
        groupLabel: "Components",
        groupPriority: 3,
      },
    },
    {
      fullPath: "/salt/components/widget/index.mdx",
      route: "/salt/components/widget/index",
      title: "Widget",
      data: {
        status: "Release Candidate",
        groupStatus: "Release Candidate",
      },
    },
    {
      fullPath: "/salt/components/button/index.mdx",
      route: "/salt/components/button/index",
      title: "Button",
    },
    {
      fullPath: "/salt/components/button/usage.mdx",
      route: "/salt/components/button/usage",
      title: "Button usage",
      sidebar: { exclude: true },
    },
    {
      fullPath: "/salt/about/index.mdx",
      route: "/salt/about/index",
      title: "About",
      sidebar: { groupPriority: 5 },
    },
  ];
  const context = {
    namespace: "salt",
    pageExtensions: [".mdx"],
    ignorePages: ["sidebar.json", "shared-config.json"],
    // A deserialised page is detached from its stored bytes, as with Mosaic's
    // YAML serialiser. Mutation alone must not update the stored document.
    serialiser: {
      serialise: async (_path, page) => Buffer.from(JSON.stringify(page)),
      deserialise: async (_path, bytes) => JSON.parse(String(bytes)),
    },
  };
  await SidebarPlugin.$afterSource(pages, context);
  const files = new Map(
    await Promise.all(
      pages.map(async (page) => [
        page.fullPath,
        await context.serialiser.serialise(page.fullPath, page),
      ]),
    ),
  );
  const filesystem = {
    promises: {
      glob: async (_pattern, { cwd, onlyDirectories }) => {
        if (onlyDirectories) return ["/salt/components", "/salt/about"];
        if (cwd === "/") return ["/salt/index.mdx"];
        return [...files.keys()].filter((path) => path.startsWith(`${cwd}/`));
      },
      readFile: async (path) => Buffer.from(files.get(path)),
      writeFile: async (path, bytes) => files.set(path, Buffer.from(bytes)),
    },
  };

  await SidebarPlugin.$beforeSend(filesystem, context, {
    rootDirGlob: "*/*",
  });
  const root = await context.serialiser.deserialise(
    "/salt/index.mdx",
    await filesystem.promises.readFile("/salt/index.mdx"),
  );
  return {
    root,
    sidebar: JSON.parse(String(files.get("/salt/sidebar.json"))),
  };
}

describe("Salt Mosaic sidebar", () => {
  it("persists navigation in the shared config consumed by PageNavigation", async () => {
    const { root, sidebar } = await generateSidebar();
    expect(sidebar).not.toHaveLength(0);
    expect(root.sharedConfig.sidebar).toEqual(sidebar);
    expect(root.sharedConfig.header).toEqual(header);
    expect(root.content).toBe("# Salt");
  });

  it("preserves section order, component order, exclusions and lab status", async () => {
    const { sidebar } = await generateSidebar();
    expect(sidebar.map(({ name }) => name)).toEqual(["About", "Components"]);
    const components = sidebar.find(({ id }) => id === "/salt/components");
    expect(components.childNodes.map(({ name }) => name)).toEqual([
      "Overview",
      "Button",
      "Widget",
    ]);
    const button = components.childNodes.find(
      ({ id }) => id === "/salt/components/button",
    );
    expect(button.childNodes.map(({ id }) => id)).toEqual([
      "/salt/components/button/index",
    ]);
    const widget = components.childNodes.find(
      ({ id }) => id === "/salt/components/widget",
    );
    expect(widget.data.status).toBe("Release Candidate");
    expect(widget.childNodes[0].status).toBe("Release Candidate");
  });
});

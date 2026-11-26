import path from "node:path";
import {
  buildSidebarTree,
  compareSidebarNodes,
} from "@jpmorganchase/mosaic-plugins/sidebar";
import { escapeRegExp } from "lodash-es";

const sidebarNameCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const compareNodes = (a, b) =>
  compareSidebarNodes(a, b) ||
  sidebarNameCollator.compare(a.name ?? "", b.name ?? "");

function createFileGlob(pattern, extensions) {
  const base = pattern.endsWith("**") ? `${pattern}/*` : pattern;
  return extensions.length === 1
    ? `${base}${extensions[0]}`
    : `${base}{${extensions.join(",")}}`;
}

function createPageTest(ignorePages, pageExtensions) {
  const extension = new RegExp(
    `${pageExtensions.map((value) => escapeRegExp(value)).join("|")}$`,
  );
  const ignored = ignorePages.length
    ? new RegExp(
        `${ignorePages.map((value) => escapeRegExp(value)).join("|")}$`,
      )
    : undefined;
  return (file) =>
    extension.test(file) &&
    !ignored?.test(file) &&
    !path.basename(file).startsWith(".");
}

/**
 * Mosaic owns sidebar traversal and sorting. Salt only decorates its nodes
 * with design-system status metadata and publishes one namespace-wide tree.
 */
const SidebarPlugin = {
  async $afterSource(pages, { ignorePages = [], pageExtensions = [] }) {
    const isVisiblePage = createPageTest(ignorePages, pageExtensions);
    for (const page of pages) {
      if (!isVisiblePage(page.fullPath)) continue;
      page.sidebar = {
        label: page.title,
        groupLabel: page.sidebar?.label || page.title,
        ...page.sidebar,
      };
    }
    return pages;
  },

  async $beforeSend(
    filesystem,
    { serialiser, ignorePages, pageExtensions, namespace },
    { filename = "sidebar.json", rootDirGlob = "*" },
  ) {
    const rootDirs = await filesystem.promises.glob(rootDirGlob, {
      onlyDirectories: true,
      extglob: true,
      cwd: "/",
    });

    const roots = await Promise.all(
      rootDirs.map(async (rootDir) => {
        const pagePaths = await filesystem.promises.glob(
          createFileGlob("**", pageExtensions),
          {
            cwd: String(rootDir),
            ignore: ignorePages.map((ignore) => `**/${ignore}`),
          },
        );
        const pages = await Promise.all(
          pagePaths.map(async (pagePath) =>
            serialiser.deserialise(
              pagePath,
              await filesystem.promises.readFile(pagePath),
            ),
          ),
        );

        // Salt's group priority and badge may be authored on any page in a
        // folder. Keep that metadata while Mosaic builds the nested tree.
        const groupMetadata = new Map();
        for (const page of pages) {
          const directory = path.posix.dirname(page.fullPath);
          const metadata = groupMetadata.get(directory) ?? {};
          if (page.sidebar?.groupPriority != null) {
            metadata.priority = page.sidebar.groupPriority;
          }
          if (page.data?.groupStatus) {
            metadata.status = page.data.groupStatus;
          }
          groupMetadata.set(directory, metadata);
        }

        const root = buildSidebarTree(pages, {
          rootDir: String(rootDir),
          compareNodes,
          transformPage: (node, page) =>
            page.data?.status ? { ...node, status: page.data.status } : node,
          transformGroup: (node, { fullPath }) => {
            const metadata = groupMetadata.get(fullPath);
            return {
              ...node,
              ...(metadata?.priority != null && {
                priority: metadata.priority,
              }),
              data: metadata?.status ? { status: metadata.status } : {},
            };
          },
        });
        if (!root) {
          console.warn(
            `[Mosaic] SidebarPlugin - Unable to create a Sidebar grouping for ${rootDir}`,
          );
        }
        return root;
      }),
    );

    const sidebar = roots.filter(Boolean).sort(compareNodes);
    if (!sidebar.length) return;

    // Persist before Mosaic resolves generated shared-config references.
    const indexPath = Array.from(
      await filesystem.promises.glob(
        createFileGlob(`${namespace}/index`, pageExtensions),
        { cwd: "/" },
      ),
    )[0];
    const page = await serialiser.deserialise(
      indexPath,
      await filesystem.promises.readFile(indexPath),
    );
    page.sharedConfig = { ...page.sharedConfig, sidebar };
    await filesystem.promises.writeFile(
      indexPath,
      await serialiser.serialise(indexPath, page),
    );
    await filesystem.promises.writeFile(
      path.posix.join("/", namespace, filename),
      JSON.stringify(sidebar),
    );
  },
};

export default SidebarPlugin;

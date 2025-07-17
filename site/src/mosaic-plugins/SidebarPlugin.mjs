import path from "node:path";
import { sidebarSortConfigSchema } from "@jpmorganchase/mosaic-schemas";
import { cloneDeep, escapeRegExp } from "lodash-es";

export function isGroupNode(node) {
  return node.kind === "group";
}
export function isDataNode(node) {
  return node.kind === "data";
}

const isNumber = (fieldData) => typeof fieldData === "number";

function doSort(a, b) {
  if (isNumber(a) && isNumber(b)) {
    return a - b;
  }
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

function sortBySharedSortConfig(nodeA, nodeB) {
  if (!isDataNode(nodeA) || !isDataNode(nodeB)) {
    return 0;
  }
  if (
    nodeA.sharedSortConfig === undefined ||
    nodeB.sharedSortConfig === undefined
  ) {
    return 0;
  }
  if (nodeA.sharedSortConfig?.arrange === "asc") {
    return doSort(
      nodeA.sharedSortConfig.fieldData,
      nodeB.sharedSortConfig.fieldData,
    );
  }
  return doSort(
    nodeB.sharedSortConfig.fieldData,
    nodeA.sharedSortConfig.fieldData,
  );
}

function sortSidebarData(sidebarData) {
  const pagesByPriority = sidebarData.map((group) => {
    if (!isGroupNode(group)) {
      return group;
    }
    if (group?.childNodes?.length > 1) {
      const sortedChildNodes = group.childNodes.sort(
        (pageA, pageB) =>
          (pageB.priority ?? -1) - (pageA.priority ?? -1) ||
          sortBySharedSortConfig(pageA, pageB),
      );
      sortSidebarData(group.childNodes);
      return { ...group, childNodes: sortedChildNodes };
    }
    return group;
  });
  return pagesByPriority;
}

function createFileGlob(patterns, pageExtensions) {
  if (Array.isArray(patterns)) {
    return patterns.map((pattern) => createFileGlob(pattern, pageExtensions));
  }
  if (pageExtensions.length === 1) {
    return `${patterns}${pageExtensions[0]}`;
  }
  return `${patterns}{${pageExtensions.join(",")}}`;
}
function getPageLevel(page) {
  return page.route.split("/").length - 2;
}
function sortByPathLevel(pathA, pathB) {
  const pathALevel = pathA.split("/").length;
  const pathBLevel = pathB.split("/").length;
  return pathBLevel - pathALevel;
}
/**
 * Given the sharedSortConfig
 * 1. find the field specified by 'field' in the sort config
 * 2. transform the field value into the type specified by 'dataType'
 * @param page
 * @param sharedSortConfig
 * @returns transformed field value
 */
function getSortFieldData(page, sharedSortConfig) {
  let fieldData;
  if (sharedSortConfig !== undefined) {
    const { field, dataType = "string" } = sharedSortConfig;
    const parts = field.replace(/^(?:\.\.\/|\.\/)+/, "").split("/");

    for (const part of parts) {
      const source = fieldData ?? page;
      if (Object.hasOwn(source, part)) {
        fieldData = source[part];
      }
    }

    switch (dataType) {
      case "date":
        fieldData = new Date(fieldData).getTime(); // call getTime to convert to a number
        break;
      case "string":
        fieldData = String(fieldData);
        break;
      case "number":
        fieldData = Number(fieldData);
        break;
      default:
        fieldData = String(fieldData);
    }
  }
  return fieldData;
}
const createPageTest = (ignorePages, pageExtensions) => {
  const extTest = new RegExp(
    `${pageExtensions.map((ext) => escapeRegExp(ext)).join("|")}$`,
  );
  const ignoreTest = new RegExp(
    `${ignorePages.map((ignore) => escapeRegExp(ignore)).join("|")}$`,
  );
  return (file) =>
    !ignoreTest.test(file) &&
    extTest.test(file) &&
    !path.basename(file).startsWith(".");
};
/**
 * Directories create groups of pages, the index file within that group is assigned GROUP_DEFAULT_PRIORITY
 * to ensure it comes first. This can be overriden by the metadata to move the position of the default page.
 */
const GROUP_DEFAULT_PRIORITY = 999;
/**
 * Sorts the pages in a folder by priority and then exports a JSON file with the
 * sidebar tree from that directory downwards and adds sidebar data into frontmatter for each page.
 *
 * Additionally, add to frontmatter
 * navigation -> prev -> { title, route }
 * navigation -> next -> { title, route }
 * to define the previous/next page in the page sequence, as defined by sidebar label and priority
 */
const SidebarPlugin = {
  async $afterSource(pages, { ignorePages = [], pageExtensions = [] }) {
    for (const page of pages) {
      const isNonHiddenPage = createPageTest(ignorePages, pageExtensions);
      if (!isNonHiddenPage(page.fullPath)) {
        continue;
      }
      const sidebar = {
        label: page.title,
        groupLabel: page?.sidebar?.label || page.title,
        ...page?.sidebar,
      };
      page.sidebar = sidebar;
    }
    return pages;
  },
  async $beforeSend(
    mutableFilesystem,
    { serialiser, ignorePages, pageExtensions, namespace },
    { filename = "sidebar.json", rootDirGlob = "*" },
  ) {
    /**
     * Create a list of pages that should be used to build a sidebar.json
     * @param rootDir - root path of sidebar
     */
    async function createPageList(rootDir) {
      const isChildOfRootDir = (pagePath) => {
        const pageDir = path.dirname(pagePath);
        return pageDir.indexOf(rootDir) === 0;
      };
      const pagePaths = await mutableFilesystem.promises.glob(
        createFileGlob(["**"], pageExtensions),
        {
          cwd: String(rootDir),
          ignore: ignorePages.map((ignore) => `**/${ignore}`),
        },
      );
      const filteredPagePaths = pagePaths.filter(isChildOfRootDir);
      const pageList = await Promise.all(
        filteredPagePaths.map(async (pagePath) => {
          return mutableFilesystem.promises
            .readFile(pagePath)
            .then((serializedContent) => {
              return serialiser.deserialise(pagePath, serializedContent);
            });
        }),
      );
      return pageList;
    }
    /**
     * Group the pages into parent/child hierarchy
     * @param pages - sidebar pages
     */
    function createGroupMap(pages) {
      const sortConfigPages = {};
      return pages.reduce((result, page) => {
        const name = page.sidebar?.label || page.title;
        const sharedSortConfig = page?.sharedConfig?.sidebar?.sort;
        if (sharedSortConfig) {
          try {
            sidebarSortConfigSchema.parse(sharedSortConfig);
            sortConfigPages[`${path.posix.dirname(page.fullPath)}`] =
              sharedSortConfig;
          } catch (e) {
            /**
             * Don't throw a PluginError here as this will stop the sidebar being generated.
             * Plugins need a way to log errors/warnings without exceptions
             */
            console.error(
              `[Mosaic] SidebarPlugin - Invalid sidebar sort config found in ${page.fullPath}`,
            );
          }
        }
        const priority = page.sidebar?.priority;
        const isGroupDefaultPage = /\/index$/.test(page.route);
        const groupPath = path.posix.dirname(page.fullPath);
        const newChildNode = {
          id: page.route,
          kind: "data",
          fullPath: page.fullPath,
          name,
          data: { level: getPageLevel(page), link: page.route },
        };

        const priorityValue = isGroupDefaultPage
          ? priority || GROUP_DEFAULT_PRIORITY
          : priority;

        if (priorityValue != null) {
          newChildNode.priority = priorityValue;
        }

        if (page?.data?.status) {
          newChildNode.status = page.data.status;
        }

        const currentChildNodes = Object.hasOwn(result, groupPath)
          ? result[groupPath].childNodes
          : [];
        const groupPriority = page.sidebar?.groupPriority;
        let newGroupNode = {
          ...result[groupPath],
          id: path.posix.dirname(page.route),
          kind: "group",
          childNodes: [...currentChildNodes, newChildNode],
          data: {},
        };
        if (isGroupDefaultPage) {
          newGroupNode = {
            ...newGroupNode,
            name: page.sidebar?.groupLabel || name,
          };
        }

        if (groupPriority != null) {
          newGroupNode.priority = groupPriority;
        }

        if (page?.data?.groupStatus) {
          newGroupNode.data.status = page.data.groupStatus;
        }

        if (!isGroupDefaultPage && sortConfigPages[groupPath] !== undefined) {
          const fieldData = getSortFieldData(page, sortConfigPages[groupPath]);
          newChildNode.sharedSortConfig = {
            ...sortConfigPages[groupPath],
            fieldData,
          };
        }
        result[groupPath] = newGroupNode;
        return result;
      }, {});
    }
    /**
     * Link the group map to their parents
     * @param groupMap - unlinked groups of pages
     * @param dirName - root path of sidebar
     */
    function linkGroupMap(groupMap, dirName) {
      const linkedGroupMap = cloneDeep(groupMap);
      const sortedGroupMapKeys =
        Object.keys(linkedGroupMap).sort(sortByPathLevel);

      for (const groupPath of sortedGroupMapKeys) {
        const parentGroupPath = path.posix.dirname(groupPath);
        if (linkedGroupMap[parentGroupPath] === undefined) {
          continue;
        }
        linkedGroupMap[parentGroupPath].childNodes = [
          ...linkedGroupMap[parentGroupPath].childNodes,
          linkedGroupMap[groupPath],
        ];
      }
      return [linkedGroupMap[dirName]];
    }

    const rootUserJourneys = await mutableFilesystem.promises.glob(
      rootDirGlob,
      {
        onlyDirectories: true,
        extglob: true,
        cwd: "/",
      },
    );
    const removeExcludedPages = (page) => !page.sidebar?.exclude;

    let sidebar = [];
    await Promise.all(
      rootUserJourneys.map(async (rootDir) => {
        const pages = await createPageList(rootDir);
        const includedPages = pages.filter((page) => removeExcludedPages(page));
        const groupMap = createGroupMap(includedPages);
        const sidebarData = linkGroupMap(groupMap, rootDir);
        if (sidebarData[0] === undefined) {
          console.warn(
            `[Mosaic] SidebarPlugin - Unable to create a Sidebar grouping for ${rootDir}`,
          );
          console.log(
            "[Mosaic] SidebarPlugin - likely you have a directory without an index file",
          );
          return;
        }
        sidebar = sidebar.concat(sortSidebarData(sidebarData));
      }),
    );

    sidebar = sidebar.sort(
      (pageA, pageB) => (pageB.priority ?? -1) - (pageA.priority ?? -1),
    );

    if (sidebar.length > 0) {
      const indexPath = Array.from(
        await mutableFilesystem.promises.glob(
          createFileGlob(`${namespace}/index`, pageExtensions),
          { cwd: "/" },
        ),
      )[0];

      await mutableFilesystem.promises
        .readFile(indexPath)
        .then((serializedContent) => {
          return serialiser.deserialise(indexPath, serializedContent);
        })
        .then((page) => {
          page.sharedConfig.sidebar = sidebar;
        });

      await mutableFilesystem.promises.writeFile(
        path.posix.join("/", namespace, filename),
        JSON.stringify(sidebar),
      );
    }
  },
};
export default SidebarPlugin;

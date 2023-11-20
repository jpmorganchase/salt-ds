const COMPONENT_OVERVIEW = {
  title: "Overview",
  route: "/salt/components/index",
};

function buildRouteNavigationData(pages) {
  const allComponentIndexPages = pages
    .filter((p) => new RegExp("components/[\\w-]+/index").test(p.route))
    .sort((a, b) => a.route.localeCompare(b.route));

  const pageIndexToNavigation = {};
  for (let index = 0; index < allComponentIndexPages.length; index++) {
    const page = allComponentIndexPages[index];
    const prev =
      index === 0
        ? COMPONENT_OVERVIEW
        : {
            title: allComponentIndexPages[index - 1].title,
            route: allComponentIndexPages[index - 1].route,
          };

    const next =
      index === allComponentIndexPages.length - 1
        ? undefined
        : {
            title: allComponentIndexPages[index + 1].title,
            route: allComponentIndexPages[index + 1].route,
          };

    pageIndexToNavigation[page.route] = {
      prev,
      ...(next ? { next } : {}), // Don't want undefined or Mosaic will throw
    };
  }
  return pageIndexToNavigation;
}

const ComponentsDocPaginatorPlugin = {
  async $afterSource(pages) {
    const componentRouteToName = buildRouteNavigationData(pages);

    for (const page of pages) {
      // Only work with components route
      if (!new RegExp(`/components/`).test(page.route)) {
        continue;
      }

      if (page.route.endsWith("/index")) {
        // Don't care about index page, they are not displayed
      } else {
        const indexPageRoute =
          page.route.substring(0, page.route.lastIndexOf("/")) + "/index";

        if (componentRouteToName[indexPageRoute]) {
          page.navigation = componentRouteToName[indexPageRoute];
        }
      }
    }
    return pages;
  },
};

export default ComponentsDocPaginatorPlugin;

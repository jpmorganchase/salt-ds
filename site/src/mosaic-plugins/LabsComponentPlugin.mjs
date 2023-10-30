import path from "node:path";
import { escapeRegExp } from "lodash-es";

function createPageTest(ignorePages, pageExtensions) {
  const extTest = new RegExp(`${pageExtensions.map(escapeRegExp).join("|")}$`);
  const ignoreTest = new RegExp(`${ignorePages.map(escapeRegExp).join("|")}$`);
  return (file) =>
    !ignoreTest.test(file) &&
    extTest.test(file) &&
    !path.basename(file).startsWith(".");
}

const LabsComponentPlugin = {
  async $afterSource(
    pages,
    { ignorePages, pageExtensions },
    { labPackageName, statusLabel, icon }
  ) {
    const isNonHiddenPage = createPageTest(ignorePages, pageExtensions);

    for (const page of pages) {
      if (!isNonHiddenPage(page.fullPath)) {
        continue;
      }

      if (page.data?.package?.name === labPackageName) {
        page.status = statusLabel;
        page.sidebar = { label: `${page.title} ${icon}` };
      }

      if (page.fullPath === "/salt/components/index.mdx") {
        // add the icon to the metadata of the Components index page
        page.labsIcon = icon;
      }
    }
    return pages;
  },
};

export default LabsComponentPlugin;

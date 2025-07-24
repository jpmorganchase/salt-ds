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

const statusLabel = "Release Candidate";
const RCPackages = ["@salt-ds/lab", "@salt-ds/embla-carousel"];

const LabsComponentPlugin = {
  async $afterSource(pages, { ignorePages, pageExtensions }) {
    const isNonHiddenPage = createPageTest(ignorePages, pageExtensions);

    for (const page of pages) {
      if (!isNonHiddenPage(page.fullPath)) {
        continue;
      }

      if (RCPackages.includes(page.data?.package?.name)) {
        page.data.status = statusLabel;
        page.data.groupStatus = statusLabel.split(" ").reduce((acc, word) => {
          return acc + word[0].toUpperCase();
        }, "");
      }
    }
    return pages;
  },
};

export default LabsComponentPlugin;

import GithubSlugger from "github-slugger";
import { toString as nodeText } from "mdast-util-to-string";

/**
 * The anchors a Markdown viewer gives a document: one per heading, slugged as
 * GitHub and the website do (repeats get `-1`, `-2`...), plus HTML `id`s.
 */
export function markdownAnchors(tree) {
  const slugger = new GithubSlugger();
  const anchors = new Set();
  const visit = (node) => {
    if (node.type === "heading") {
      anchors.add(slugger.slug(nodeText(node)));
    } else if (node.type === "html") {
      for (const [, id] of node.value.matchAll(/\bid="([^"]+)"/g)) {
        anchors.add(id);
      }
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(tree);
  return anchors;
}

function forEachHeading(nodes, callback) {
  for (const node of nodes) {
    if (node.type === "heading") callback(node);
    if (node.children) forEachHeading(node.children, callback);
  }
}

/**
 * Maps each site page's heading anchors to the anchors those headings get in
 * the generated document. A document can merge several site pages, such as a
 * component's tabs, and adds headings of its own, so a repeated heading can
 * be numbered differently than on the site. `children` is the whole document;
 * `segments` lists each site page's route and the nodes converted from it.
 * Headings written as JSX on the site get no anchor there.
 */
export function siteAnchorMap(children, segments) {
  const documentSlugger = new GithubSlugger();
  const documentAnchors = new Map();
  forEachHeading(children, (node) => {
    documentAnchors.set(node, documentSlugger.slug(nodeText(node)));
  });
  const map = new Map();
  for (const { route, nodes } of segments) {
    const siteSlugger = new GithubSlugger();
    const anchors = new Map();
    forEachHeading(nodes, (node) => {
      if (node.data?.jsx) return;
      const siteAnchor = siteSlugger.slug(nodeText(node));
      const documentAnchor = documentAnchors.get(node);
      if (documentAnchor && !anchors.has(siteAnchor)) {
        anchors.set(siteAnchor, documentAnchor);
      }
    });
    map.set(route, anchors);
  }
  return map;
}

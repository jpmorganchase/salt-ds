// @ts-nocheck

// For some reason, import from root doesn't work
import { parse, walk } from "css-tree/dist/csstree.esm";

import {
  CssNode,
  Rule,
  Raw,
  SelectorList,
  ClassSelector,
  Selector,
} from "css-tree";

export type Declaration = { property: string; value: string };
export type DeclarationData = {
  groupName: string;
  declarations: Declaration[];
}[];

export function parseCssToFlowData(css: string) {
  const ast = parse(css);
  const results: DeclarationData = [];
  walk(ast, {
    visit: "Rule",
    enter(node: Rule) {
      const declarations: Declaration[] = [];
      node.block.children.forEach((x) => {
        if (x.type === "Declaration") {
          declarations.push({
            property: x.property,
            // TODO: check Raw type
            value: (x.value as Raw).value.trim(),
          });
        }
      });
      const group = {
        declarations,
        groupName: selectorListToString(node.prelude),
      };
      results.push(group);
    },
  });
  return results;
}

function selectorListToString(selectorList: SelectorList) {
  return Array.from(
    selectorList.children.map((x) => {
      return Array.from(
        (x as Selector).children.map((y) => (y as ClassSelector).name)
      ).join(",");
    })
  ).join(",");
}

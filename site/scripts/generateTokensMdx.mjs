import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capitalize } from "lodash-es";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import characteristicsTokens from "../src/components/css-display/cssCharacteristics.json" assert {
  type: "json",
};
import characteristicsTokensNext from "../src/components/css-display/cssCharacteristics-next.json" assert {
  type: "json",
};

const groupByType = (data) => {
  const groupedData = {};

  const regex = /--salt-(\w+)/;

  for (const [name, value] of Object.entries(data)) {
    const match = regex.exec(name);
    if (match?.[1]) {
      const groupName = match[1];
      if (!groupedData[groupName]) {
        groupedData[groupName] = {};
      }
      groupedData[groupName][name] = value;
    }
  }

  return groupedData;
};

// https://mdxjs.com/packages/remark-mdx/

const tokenDescriptions = {
  accent:
    "Components which can or should be emphasized against others in close proximity.",
  actionable:
    "Components with the ability to action something, action is performed immediately (the component doesn’t stay selected).",
  container:
    "Group of components used to contain and separate different types of content and allow hierarchical organization.",
  draggable:
    "Components that can be grabbed and moved to a target area (related to Target).",
  editable: "Components that hold mutable data and allow for data entry.",
  focused:
    "Components which can be focused using the mouse or keyboard.The following variables can be used on their own, but make up parts of the more commonly used borders and outlines below.",
  navigable:
    "Components that allow a user to navigate across UI sections or data sets and change view context.",
  overlayable:
    "Components that may form a hierarchy and stack upon or beneath other elements of the UI.",
  selectable:
    "Group of components that allow single or multiple selection, Selection can trigger actions.",
  separable:
    "Group of attributes to separate information/elements. Connected to Container. Level 1 - used when subtle division is needed/to divide similar items e.g. options within a list, individual comments. Level 2 - used to divide related areas e.g. heading and body text. Level 3 - used to separate areas of content that are not closely related e.g. app header from main content",
  status:
    "Components which have attributes that denote status and the severity of that status.",
  taggable: "Components allowing for individual items or data to be organized.",
  target:
    "Components which indicate a target area where a draggable item can be dropped (related to Draggable).",
  text: "All text examples are shown using the default fontWeight token.",
  track:
    "Components which have the ability to visually indicate progress, scale, or range along a defined track.",
};
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const startWith = (type = '') => `---
title: Characteristics${type}
layout: DetailTechnical
---
`;

// Parse the MDX content into an AST
const processor = unified()
  .use(remarkParse) // Parse Markdown
  .use(remarkGfm) // Enable GFM (including tables)
  .use(remarkMdx) // Parse MDX
  .use(remarkStringify); // Convert AST back to MDX

const legacyAst = processor.parse("");
const nextAst = processor.parse("");
//   `|Name &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Value |
// | --- | --- |
// | aaa | bbb |
// `); // `<Abc name={"expression&nbsp;&nbsp;"} />`);

const tokensByTypeLegacy = groupByType(characteristicsTokens);
console.log({ tokensByTypeLegacy });
const tokensByTypeNext = groupByType(characteristicsTokensNext);
console.log({ tokensByTypeNext });

const getTableRowAst = (key, value, theme) => ({
  type: "tableRow",
  children: [
    {
      type: "tableCell",
      children: [
        {
          type: "mdxJsxTextElement",
          name: theme === 'next' ?  "NextThemedBlockView" : "LegacyThemedBlockView",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "name",
              value: key,
            },
          ],
        },
      ],
    },
    {
      type: "tableCell",
      children: [
        {
          type: "mdxJsxTextElement",
          name: "CopyToClipboard",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "value",
              value: key,
            },
          ],
        },
      ],
    },
    {
      type: "tableCell",
      children: [
        {
          type: "inlineCode",
          value: value,
        },
      ],
    },
  ],
});


// Traverse and modify the AST
[legacyAst, nextAst].forEach(((astObj,index) => {
  visit(astObj, "root", (node) => {
    for (const [key, value] of Object.entries(tokenDescriptions)) {
      const tokensInType = index === 0 ?  tokensByTypeLegacy[key] : tokensByTypeNext[key];
  
      if (!tokensInType) {
        console.error("Can't find tokens for type: ", key);
        continue;
      }

      // Insert a new heading and paragraph at the end of the document
      node.children.push({
        type: "heading",
        depth: 2,
        children: [{ type: "text", value: capitalize(key) }],
      });

      node.children.push({
        type: "paragraph",
        children: [{ type: "text", value: value }],
      });
  
      const tableRows = tokensInType
        ? Object.entries(tokensInType).map(([key, value]) =>
            getTableRowAst(key, value, index === 0 ? "legacy" : "next"),
          )
        : [];
  
      node.children.push({
        type: "table",
        children: [
          {
            type: "tableRow",
            children: [
              {
                type: "tableCell",
                children: [
                  {
                    type: "text",
                    value: "Preview",
                  },
                ],
              },
              {
                type: "tableCell",
                children: [
                  {
                    type: "text",
                    value: "Name",
                  },
                ],
              },
              {
                type: "tableCell",
                children: [
                  {
                    type: "text",
                    value: "Default Value",
                  },
                ],
              },
            ],
          },
          ...tableRows,
        ],
      });
    }
  });
}
))

// Serialize the modified AST back to MDX
const legacyMdxContent = processor.stringify(legacyAst);
const nextMdxContent = processor.stringify(nextAst);

const legacyContentToWrite = startWith() + legacyMdxContent;
const nextContentToWrite = startWith(' (Next/JPM Brand)') + nextMdxContent;

fs.writeFileSync(
  path.join(__dirname, "../docs/themes/characteristics.mdx"),
  legacyContentToWrite,
  "utf8",
);

fs.writeFileSync(
  path.join(__dirname, "../docs/themes/characteristics-next.mdx"),
  nextContentToWrite,
  "utf8",
);

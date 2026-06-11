import {
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import type { CSSProperties } from "react";
import type { Item } from "./TableOfContents";
import { stripMarkdownLinks } from "./utils";

export function TableOfContentsItem({
  item,
  current,
}: {
  item: Item;
  current?: string;
}) {
  const selected = item.id === current;

  const depthStyle = {
    "--verticalNavigationItem-depth": Math.max(item.level - 1, 0),
  } as CSSProperties;

  return (
    <VerticalNavigationItem active={selected} style={depthStyle}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger
          href={`#${item.id}`}
          aria-current={selected ? "location" : undefined}
        >
          <VerticalNavigationItemLabel>
            {stripMarkdownLinks(item.text)}
          </VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

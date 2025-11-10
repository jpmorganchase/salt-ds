import type { SidebarItem } from "@jpmorganchase/mosaic-store";
import {
  Badge,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  VerticalNavigation as VerticalNavigationComponent,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/core";
import { useState } from "react";
import { LinkBase } from "../../link/Link";
import {
  containsSelected,
  mapMenu,
  normalizeSelectedNodeId,
  statusToBadgeValue,
} from "./utils";
import styles from "./VerticalNavigation.module.css";

export type Item = {
  title: string;
  href: string;
  status?: string;
  children?: Item[];
};

type NestedItemProps = {
  item: Item;
  selectedNodeId?: string;
  selectedGroupIds: Set<string>;
};

export type VerticalNavigationProps = {
  /** Selected item groups ids to expand */
  selectedGroupIds: Set<string>;
  /** String ID of the selected item */
  selectedNodeId?: string;
  /** Navigation item data */
  menu: SidebarItem[];
};

const NestedItem = ({
  item,
  selectedNodeId,
  selectedGroupIds,
}: NestedItemProps) => {
  const isOpen = containsSelected(item, selectedNodeId);
  const [expanded, setExpanded] = useState(isOpen);

  const { title, status, href, children } = item;
  const isItemActive = selectedNodeId === href;
  const isGroupActive = selectedGroupIds.has(href);

  if (Array.isArray(children) && children.length > 0) {
    return (
      <VerticalNavigationItem active={isGroupActive && !expanded}>
        <Collapsible
          onOpenChange={() => setExpanded((old) => !old)}
          open={expanded}
        >
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                <VerticalNavigationItemLabel>
                  {title}
                </VerticalNavigationItemLabel>
                {status && (
                  <Badge
                    aria-label={status}
                    value={statusToBadgeValue(status)}
                  />
                )}
                <VerticalNavigationItemExpansionIcon />
              </VerticalNavigationItemTrigger>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {children.map((child) => (
                <NestedItem
                  key={child.href}
                  item={child}
                  selectedNodeId={selectedNodeId}
                  selectedGroupIds={selectedGroupIds}
                />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </Collapsible>
      </VerticalNavigationItem>
    );
  }

  return (
    <VerticalNavigationItem active={isItemActive}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger render={<LinkBase href={href} />}>
          <VerticalNavigationItemLabel>{title}</VerticalNavigationItemLabel>
          {status && (
            <Badge aria-label={status} value={statusToBadgeValue(status)} />
          )}
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
};

export const VerticalNavigation = ({
  menu,
  selectedNodeId,
  selectedGroupIds,
}: VerticalNavigationProps) => {
  const mappedNavData = mapMenu(menu);

  const normalizedSelectedNodeId = normalizeSelectedNodeId(
    selectedNodeId || "",
    mappedNavData,
  );

  return (
    <VerticalNavigationComponent
      aria-label="Sidebar"
      data-testid="vertical-navigation"
      appearance="bordered"
      className={styles.verticalNavigation}
    >
      {mappedNavData.map((item) => (
        <NestedItem
          key={item.href}
          item={item}
          selectedNodeId={normalizedSelectedNodeId}
          selectedGroupIds={selectedGroupIds}
        />
      ))}
    </VerticalNavigationComponent>
  );
};

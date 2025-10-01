import type { SidebarItem } from "@jpmorganchase/mosaic-store";
import {
  Badge,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  FlexLayout,
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
};

export type VerticalNavigationProps = {
  /** String ID of the selected item */
  selectedNodeId?: string;
  /** Navigation item data */
  menu: SidebarItem[];
};

const NestedItem = ({ item, selectedNodeId }: NestedItemProps) => {
  const isOpen = containsSelected(item, selectedNodeId);
  const [collapsed, setCollapsed] = useState(isOpen);

  const { title, status, href, children } = item;
  const isItemSelected = selectedNodeId === href;

  if (Array.isArray(children) && children.length > 0) {
    return (
      <VerticalNavigationItem active={isItemSelected && collapsed}>
        <Collapsible
          onOpenChange={() => setCollapsed(!collapsed)}
          open={collapsed}
        >
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                <VerticalNavigationItemLabel>
                  <FlexLayout justify="space-between">
                    {title}
                    {status && (
                      <Badge
                        aria-label={status}
                        value={statusToBadgeValue(status)}
                      />
                    )}
                  </FlexLayout>
                </VerticalNavigationItemLabel>
                <VerticalNavigationItemExpansionIcon />
              </VerticalNavigationItemTrigger>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {children.map((child) => (
                <NestedItem
                  key={child.title}
                  item={child}
                  selectedNodeId={selectedNodeId}
                />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </Collapsible>
      </VerticalNavigationItem>
    );
  }

  return (
    <VerticalNavigationItem active={isItemSelected}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger render={<LinkBase href={href} />}>
          <VerticalNavigationItemLabel>
            <FlexLayout justify="space-between">
              {title}
              {status && (
                <Badge aria-label={status} value={statusToBadgeValue(status)} />
              )}
            </FlexLayout>
          </VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
};

export const VerticalNavigation = ({
  menu,
  selectedNodeId,
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
        />
      ))}
    </VerticalNavigationComponent>
  );
};

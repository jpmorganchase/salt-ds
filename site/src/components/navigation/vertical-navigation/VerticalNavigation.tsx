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
import { useMemo, useState } from "react";
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

  if (Array.isArray(children) && children.length > 0) {
    return (
      <VerticalNavigationItem active={selectedNodeId === href && collapsed}>
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
    <VerticalNavigationItem active={selectedNodeId === href}>
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
  const navData = mapMenu(menu);

  // console.log("navData: ", navData);
  // console.log("menu: ", menu);
  // console.log("selectedNodeId: ", selectedNodeId);

  const normalizedSelectedNodeId = useMemo(
    () => normalizeSelectedNodeId(selectedNodeId || "", navData),
    [selectedNodeId, navData],
  );

  return (
    <VerticalNavigationComponent
      aria-label="Sidebar"
      data-testid="vertical-navigation"
      appearance="bordered"
      className={styles.verticalNavigation}
    >
      {navData.map((item) => (
        <NestedItem
          key={item.title}
          item={item}
          selectedNodeId={normalizedSelectedNodeId}
        />
      ))}
    </VerticalNavigationComponent>
  );
};

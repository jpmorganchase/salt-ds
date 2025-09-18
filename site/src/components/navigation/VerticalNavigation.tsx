import type { SidebarItem, SidebarNode } from "@jpmorganchase/mosaic-store";
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
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { LinkBase } from "../link/Link";

export type VerticalNavigationProps = {
  /** Selected item groups ids to expand */
  selectedGroupIds?: Set<string>;
  /** Navigation item data */
  menu: SidebarItem[];
  className?: string;
};

function statusToBadgeValue(status: string) {
  return status.split(" ").reduce((acc, word) => {
    return acc + word[0].toUpperCase();
  }, "");
}

function findAncestorGroupIds(
  menu: SidebarItem[],
  pathname: string,
): Set<string> {
  const result = new Set<string>();

  function traverse(nodes: SidebarItem[], ancestors: string[] = []): boolean {
    for (const node of nodes) {
      // @ts-expect-error
      const { id, kind, data } = node;

      if (kind === "group" && node.childNodes) {
        if (traverse(node.childNodes, [...ancestors, id])) {
          return true;
        }
      } else if (!kind || kind === "data") {
        // Check if this is a leaf node with a link that matches pathname
        const nodeLink = data?.link;
        if (nodeLink === pathname) {
          for (const ancestorId of ancestors) {
            result.add(ancestorId);
          }
          return true;
        }
      }
    }
    return false;
  }

  traverse(menu);
  return result;
}

const renderNavigationItem = (
  item: SidebarItem,
  selectedNodeId: string | undefined,
  expandedGroupIds: Set<string>,
  selectedGroupIds: Set<string>,
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>,
  level: number,
) => {
  // @ts-expect-error
  const { id, kind, name, data } = item;
  const isGroup = kind === "group";
  const hasSinglePageInGroup = isGroup && item.childNodes?.length === 1;
  const singlePageInGroup: SidebarNode | undefined =
    hasSinglePageInGroup && item.childNodes[0].kind === "data"
      ? item.childNodes[0]
      : undefined;
  let link: string | undefined;
  if (singlePageInGroup) {
    link = singlePageInGroup?.data?.link;
  } else if (!isGroup) {
    link = item?.data?.link;
  }
  const childNodes = isGroup ? item.childNodes : undefined;
  const isExpanded = isGroup ? expandedGroupIds.has(id) : false;
  const containsSelectedNode = selectedGroupIds.has(id);
  const shouldRenderAsParent = !link;
  let isActive = false;

  if (shouldRenderAsParent) {
    isActive = !isExpanded && containsSelectedNode;
  } else if (selectedNodeId) {
    // Compare pathname with the actual link href
    isActive = selectedNodeId === link;
  }

  const status = data?.status;

  if (shouldRenderAsParent) {
    return (
      <VerticalNavigationItem active={isActive} key={id}>
        <Collapsible open={isExpanded}>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                <VerticalNavigationItemLabel>
                  <FlexLayout justify="space-between">
                    {name}
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
            <VerticalNavigationSubMenu
              style={{
                marginBottom: 10,
              }}
            >
              {childNodes?.map((childItem) =>
                renderNavigationItem(
                  childItem,
                  selectedNodeId,
                  expandedGroupIds,
                  selectedGroupIds,
                  setExpanded,
                  level + 1,
                ),
              )}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </Collapsible>
      </VerticalNavigationItem>
    );
  }

  return (
    <VerticalNavigationItem active={isActive} key={id}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger
          href={link}
          render={(props) => <LinkBase {...props} href={link} />}
        >
          <VerticalNavigationItemLabel>
            <FlexLayout justify="space-between">
              {name}
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

export const VerticalNavigation: React.FC<VerticalNavigationProps> = ({
  menu,
  selectedGroupIds = new Set(),
  className,
}) => {
  const pathname = usePathname();

  // Find ancestor groups for current pathname to ensure they're expanded
  const ancestorGroupIds = findAncestorGroupIds(menu, pathname);
  const allSelectedGroupIds = new Set([
    ...selectedGroupIds,
    ...ancestorGroupIds,
  ]);

  const [expandedGroupIds, setExpandedGroupIds] = useState(allSelectedGroupIds);
  const [prevPathname, setPreviousPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    const newAncestorGroupIds = findAncestorGroupIds(menu, pathname);
    const uniqueSet = new Set([
      ...expandedGroupIds,
      ...selectedGroupIds,
      ...newAncestorGroupIds,
    ]);
    setExpandedGroupIds(uniqueSet);
    setPreviousPathname(pathname);
  }

  return (
    <VerticalNavigationComponent
      aria-label="Sidebar"
      data-testid="vertical-navigation"
      appearance="bordered"
      style={{ marginLeft: 24 }}
      className={className}
    >
      {menu.map((item) =>
        renderNavigationItem(
          item,
          pathname,
          expandedGroupIds,
          allSelectedGroupIds,
          setExpandedGroupIds,
          0,
        ),
      )}
    </VerticalNavigationComponent>
  );
};

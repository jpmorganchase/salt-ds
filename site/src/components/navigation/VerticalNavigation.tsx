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
import { useRouter } from "next/router";
import type React from "react";
import { useMemo, useState } from "react";
import { LinkBase } from "../link/Link";

export type VerticalNavigationProps = {
  /** Selected item groups ids to expand */
  selectedGroupIds?: Set<string>;
  /** String ID of the selected item */
  selectedNodeId?: string;
  /** Navigation item data */
  menu: SidebarItem[];
  className?: string;
};

function statusToBadgeValue(status: string) {
  return status.split(" ").reduce((acc, word) => {
    return acc + word[0].toUpperCase();
  }, "");
}

// Helper function to find all parent group IDs for a given path
function findParentGroupIds(
  items: SidebarItem[],
  targetPath: string,
  parentIds: string[] = [],
): string[] {
  for (const item of items) {
    // @ts-expect-error
    const { id, kind, data, childNodes } = item;
    const isGroup = kind === "group";

    // Get the link for this item
    const hasSinglePageInGroup = isGroup && childNodes?.length === 1;
    const singlePageInGroup =
      hasSinglePageInGroup && childNodes[0].kind === "data"
        ? childNodes[0]
        : undefined;

    const link =
      singlePageInGroup?.data?.link || (!isGroup ? data?.link : undefined);

    // Check if this item matches the target path
    if (link) {
      const matches = singlePageInGroup
        ? targetPath.startsWith(id.replace("/index", ""))
        : targetPath === id || targetPath.startsWith(id);

      if (matches) {
        return parentIds;
      }
    }

    // If this is a group with children, search recursively
    if (isGroup && childNodes) {
      const result = findParentGroupIds(childNodes, targetPath, [
        ...parentIds,
        id,
      ]);
      if (result.length > 0) {
        return result;
      }
    }
  }

  return [];
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
    // For parent groups, show as active only when collapsed AND contains selected node
    // This allows parent groups to be collapsed even when they contain active items
    isActive = !isExpanded && containsSelectedNode;
  } else if (selectedNodeId) {
    isActive = singlePageInGroup
      ? selectedNodeId.startsWith(id.replace("/index", ""))
      : selectedNodeId === id;
  }

  const status = data?.status;

  const handleToggle = (
    _event: React.SyntheticEvent<HTMLButtonElement>,
    open: boolean,
  ) => {
    if (open) {
      setExpanded(new Set([...expandedGroupIds, id]));
    } else {
      const filteredArray = Array.from(expandedGroupIds).filter(
        (expandedNodeId) => expandedNodeId !== id,
      );
      setExpanded(new Set<string>(filteredArray));
    }
  };

  if (shouldRenderAsParent) {
    return (
      <VerticalNavigationItem active={isActive} key={id}>
        <Collapsible open={isExpanded} onOpenChange={handleToggle}>
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
            <VerticalNavigationSubMenu>
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
  selectedNodeId,
}) => {
  const router = useRouter();
  const currentPath = router.asPath;

  // Calculate which groups should be auto-expanded based on current path
  const autoExpandedGroupIds = useMemo(() => {
    const parentGroupIds = findParentGroupIds(menu, currentPath);
    return new Set([...selectedGroupIds, ...parentGroupIds]);
  }, [menu, currentPath, selectedGroupIds]);

  const [expandedGroupIds, setExpandedGroupIds] =
    useState(autoExpandedGroupIds);
  const [prevPath, setPrevPath] = useState(currentPath);

  // Update expanded groups when path changes, but preserve manual state
  if (prevPath !== currentPath) {
    const newAutoExpanded = new Set([
      ...selectedGroupIds,
      ...findParentGroupIds(menu, currentPath),
    ]);
    // Merge with current expanded state to preserve manual expansions
    setExpandedGroupIds(new Set([...expandedGroupIds, ...newAutoExpanded]));
    setPrevPath(currentPath);
  }

  return (
    <VerticalNavigationComponent
      aria-label="Sidebar"
      data-testid="vertical-navigation"
      appearance="bordered"
      style={{ paddingLeft: 24 }}
    >
      {menu.map((item) =>
        renderNavigationItem(
          item,
          selectedNodeId,
          expandedGroupIds,
          selectedGroupIds,
          setExpandedGroupIds,
          0,
        ),
      )}
    </VerticalNavigationComponent>
  );
};

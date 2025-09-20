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
import type React from "react";
import { useMemo, useRef, useState } from "react";
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

interface RenderNavigationItemParams {
  item: SidebarItem;
  selectedNodeId?: string;
  expandedGroupIds: Set<string>;
  selectedGroupIds: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  level: number;
  activeItemRef: React.MutableRefObject<HTMLElement | null>;
  hasInitiallyScrolled: React.MutableRefObject<boolean>;
}

const renderNavigationItem = ({
  item,
  selectedNodeId,
  expandedGroupIds,
  selectedGroupIds,
  setExpanded,
  level,
  activeItemRef,
  hasInitiallyScrolled,
}: RenderNavigationItemParams) => {
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
    isActive = singlePageInGroup
      ? selectedNodeId.startsWith(id.replace("/index", ""))
      : selectedNodeId === id;
  }

  const status = data?.status;

  // Callback ref to capture active item
  const isCurrentlyActive =
    selectedNodeId === id ||
    (singlePageInGroup && selectedNodeId?.startsWith(id.replace("/index", "")));

  const setItemRef = (element: HTMLLIElement | null) => {
    if (isCurrentlyActive && element) {
      activeItemRef.current = element;
      // Only scroll on initial load, not on subsequent navigation changes
      if (!hasInitiallyScrolled.current) {
        hasInitiallyScrolled.current = true;
        element.scrollIntoView();
      }
    }
  };

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
      <VerticalNavigationItem
        active={isActive}
        key={id}
        ref={setItemRef}
        style={{ scrollMarginTop: 24 }}
      >
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
                renderNavigationItem({
                  item: childItem,
                  selectedNodeId,
                  expandedGroupIds,
                  selectedGroupIds,
                  setExpanded,
                  level: level + 1,
                  activeItemRef,
                  hasInitiallyScrolled,
                }),
              )}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </Collapsible>
      </VerticalNavigationItem>
    );
  }

  return (
    <VerticalNavigationItem
      active={isActive}
      key={id}
      ref={setItemRef}
      style={{ scrollMarginTop: 24 }}
    >
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
  // Ref to track the active navigation item
  const activeItemRef = useRef<HTMLElement | null>(null);
  // Flag to track if this is the initial load
  const hasInitiallyScrolled = useRef(false);

  // Calculate which groups should be auto-expanded based on selectedNodeId
  const autoExpandedGroupIds = useMemo(() => {
    if (!selectedNodeId) return new Set([...selectedGroupIds]);
    const parentGroupIds = findParentGroupIds(menu, selectedNodeId);
    return new Set([...selectedGroupIds, ...parentGroupIds]);
  }, [menu, selectedNodeId, selectedGroupIds]);

  const [expandedGroupIds, setExpandedGroupIds] =
    useState(autoExpandedGroupIds);
  const [prevSelectedNodeId, setPrevSelectedNodeId] = useState(selectedNodeId);

  // Update expanded groups when selectedNodeId changes, but preserve manual state
  if (prevSelectedNodeId !== selectedNodeId) {
    const newAutoExpanded = new Set([
      ...selectedGroupIds,
      ...(selectedNodeId ? findParentGroupIds(menu, selectedNodeId) : []),
    ]);
    setExpandedGroupIds(new Set([...expandedGroupIds, ...newAutoExpanded]));
    setPrevSelectedNodeId(selectedNodeId);
  }

  return (
    <VerticalNavigationComponent
      aria-label="Sidebar"
      data-testid="vertical-navigation"
      appearance="bordered"
      style={{ paddingLeft: 24 }}
    >
      {menu.map((item) =>
        renderNavigationItem({
          item,
          selectedNodeId,
          expandedGroupIds,
          selectedGroupIds,
          setExpanded: setExpandedGroupIds,
          level: 0,
          activeItemRef,
          hasInitiallyScrolled,
        }),
      )}
    </VerticalNavigationComponent>
  );
};

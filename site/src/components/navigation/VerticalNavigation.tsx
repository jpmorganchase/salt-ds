import type { SidebarItem, SidebarNode } from "@jpmorganchase/mosaic-store";
import {
  Badge,
  NavigationItem,
  type NavigationItemProps,
  StackLayout,
} from "@salt-ds/core";
import type React from "react";
import { type MouseEventHandler, useState } from "react";
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

const renderItem: NavigationItemProps["render"] = ({ href, ...rest }) => {
  if (href) {
    return <LinkBase {...rest} href={href} />;
  }
  return <button {...rest} />;
};

const renderNavigationItem = (
  item: SidebarItem,
  selectedNodeId: string | undefined,
  expandedGroupIds: Set<string>,
  selectedGroupIds: Set<string>,
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>,
  level: number,
) => {
  // @ts-ignore
  const { id, kind, name, data } = item;
  const isGroup = kind === "group";
  const hasSinglePageInGroup = isGroup && item.childNodes.length === 1;
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

  const handleExpand: MouseEventHandler<
    HTMLAnchorElement | HTMLButtonElement
  > = (event) => {
    event.stopPropagation();
    if (!expandedGroupIds.has(id)) {
      setExpanded(new Set([...expandedGroupIds, id]));
    } else {
      const filteredArray = Array.from(expandedGroupIds).filter(
        (expandedNodeId) => expandedNodeId !== id,
      );
      setExpanded(new Set<string>(filteredArray));
    }
  };

  const status = data?.status;

  return (
    <li key={id}>
      <NavigationItem
        href={link}
        active={isActive}
        orientation="vertical"
        onExpand={shouldRenderAsParent ? handleExpand : undefined}
        parent={shouldRenderAsParent}
        render={renderItem}
        expanded={isExpanded}
        level={level}
      >
        {name} {status && <Badge value={status} />}
      </NavigationItem>
      {shouldRenderAsParent && isExpanded ? (
        <StackLayout
          as="ul"
          gap="var(--salt-spacing-fixed-100)"
          style={{
            width: "100%",
            listStyle: "none",
            paddingLeft: 0,
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
        </StackLayout>
      ) : null}
    </li>
  );
};

export const VerticalNavigation: React.FC<VerticalNavigationProps> = ({
  menu,
  selectedGroupIds = new Set(),
  selectedNodeId,
  className,
}) => {
  const [expandedGroupIds, setExpandedGroupIds] = useState(selectedGroupIds);
  const [prevSelectedNodeId, setPreviousSelectedNodeId] =
    useState(selectedNodeId);
  if (prevSelectedNodeId !== selectedNodeId) {
    const uniqueSet = new Set([...expandedGroupIds, ...selectedGroupIds]);
    setExpandedGroupIds(uniqueSet);
    setPreviousSelectedNodeId(selectedNodeId);
  }

  return (
    <nav className={className}>
      <StackLayout
        data-testid="vertical-navigation"
        as="ul"
        gap="var(--salt-spacing-fixed-100)"
        style={{ listStyle: "none", paddingLeft: 0 }}
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
      </StackLayout>
    </nav>
  );
};

import type { SidebarItem, SidebarNode } from "@jpmorganchase/mosaic-store";
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
import type React from "react";
import { useState } from "react";
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
    isActive = singlePageInGroup
      ? selectedNodeId.startsWith(id.replace("/index", ""))
      : selectedNodeId === id;
  }

  const status = data?.status;

  if (shouldRenderAsParent) {
    return (
      <VerticalNavigationItem active={isActive} key={id}>
        <Collapsible>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                <VerticalNavigationItemLabel>
                  {name}
                  {status && (
                    <Badge
                      aria-label={status}
                      value={statusToBadgeValue(status)}
                    />
                  )}
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
          <VerticalNavigationItemLabel>{name}</VerticalNavigationItemLabel>
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
  const [expandedGroupIds, setExpandedGroupIds] = useState(selectedGroupIds);
  const [prevSelectedNodeId, setPreviousSelectedNodeId] =
    useState(selectedNodeId);
  if (prevSelectedNodeId !== selectedNodeId) {
    const uniqueSet = new Set([...expandedGroupIds, ...selectedGroupIds]);
    setExpandedGroupIds(uniqueSet);
    setPreviousSelectedNodeId(selectedNodeId);
  }

  return (
    <VerticalNavigationComponent
      aria-label="Sidebar"
      data-testid="vertical-navigation"
      appearance="indicator"
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

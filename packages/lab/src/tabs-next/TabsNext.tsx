import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useCallback,
} from "react";
import { StackLayout, useControlled, useId } from "@salt-ds/core";
import { TabstripNext, TabstripNextProps } from "./TabstripNext";
import { TabNext } from "./TabNext";
import { TabPanel } from "../tabs/TabPanel";

export type TabsNextProps = TabstripNextProps;

type TabElement = ReactElement<{
  label: string;
  id: string;
  "aria-labelledby": string;
}>;
function isTabPanel(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === TabPanel;
}

export const TabsNext = ({
  children,
  activeTabIndex: activeTabIndexProp,
  defaultActiveTabIndex,
  onActiveChange,
  onMoveTab,
  ...props
}: TabsNextProps) => {
  const tabs = Children.toArray(children).filter(isTabPanel);

  const [activeTabIndex, setActiveTabIndex] = useControlled({
    controlled: activeTabIndexProp,
    default: defaultActiveTabIndex ?? 0,
    name: "useTabs",
    state: "activeTabIndex",
  });

  const uniqueId = useId();
  const getTabId = useCallback(
    (index?: number | null) => {
      return `tab-${uniqueId ?? "unknown"}-${index ?? ""}`;
    },
    [uniqueId]
  );
  const getTabpanelId = useCallback(
    (index?: number | null) => {
      return `tabpanel-${uniqueId ?? "unknown"}-${index ?? ""}`;
    },
    [uniqueId]
  );

  return (
    <StackLayout gap={0}>
      <TabstripNext
        {...props}
        getTabId={getTabId}
        activeTabIndex={activeTabIndex}
        onActiveChange={(index) => {
          setActiveTabIndex(index!);
          onActiveChange?.(index);
        }}
      >
        {tabs.map((tabPanel) => {
          const label = tabPanel.props.label;
          return (
            <TabNext ariaControls={getTabpanelId(activeTabIndex)} label={label}>
              {label}
            </TabNext>
          );
        })}
      </TabstripNext>
      {typeof activeTabIndex === "number"
        ? cloneElement(tabs[activeTabIndex], {
            id: getTabpanelId(activeTabIndex),
            "aria-labelledby": getTabId(activeTabIndex),
          })
        : null}
    </StackLayout>
  );
};

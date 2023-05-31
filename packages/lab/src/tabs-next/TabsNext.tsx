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
import { TabPanelNext } from "./TabPanelNext";

export type TabsNextProps = TabstripNextProps;

type TabElement = ReactElement<{
  label: string;
  id: string;
  "aria-labelledby": string;
}>;
function isTabPanel(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === TabPanelNext;
}

export const TabsNext = ({
  children,
  activeTab: activeTabProp,
  defaultActiveTab,
  onActiveChange,
  ...props
}: TabsNextProps) => {
  const tabs = Children.toArray(children).filter(isTabPanel);

  const [activeTab, setActiveTab] = useControlled({
    controlled: activeTabProp,
    default: defaultActiveTab ?? tabs[0]?.props.id,
    name: "useTabs",
    state: "activeTabIndex",
  });

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
        activeTab={activeTab}
        onActiveChange={(id) => {
          if (id) {
            setActiveTab(id);
            onActiveChange?.(id);
          }
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

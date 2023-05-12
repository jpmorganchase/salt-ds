import { Children, cloneElement, isValidElement, ReactNode } from "react";
import { StackLayout, useControlled, useId } from "@salt-ds/core";
import { TabstripNext, TabstripNextProps } from "./TabstripNext";
import { TabNext } from "./TabNext";
import { TabPanelNext } from "./TabPanelNext";
import { TabElement } from "./TabsNextTypes";

export type TabsNextProps = Omit<TabstripNextProps, "defaultSelectedTab"> & {
  defaultSelectedTab?: string;
  id?: string;
};

function isTabPanel(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === TabPanelNext;
}

export const TabsNext = ({
  children,
  selectedTab: selectedTabProp,
  defaultSelectedTab,
  onSelectTab: onSelectTabProp,
  id,
  ...props
}: TabsNextProps) => {
  const tabs = Children.toArray(children).filter(isTabPanel);
  const [selectedTab, setSelectedTab] = useControlled({
    controlled: selectedTabProp,
    default: defaultSelectedTab ?? tabs[0]?.props.value,
    name: "TabsNext",
    state: "selectedTab",
  });

  const uniqueId = useId(id);
  const getTabId = (tab: TabElement) => {
    return tab.props.id || `${uniqueId ?? "tabs"}-tab-${tab.props.value}`;
  };
  const getTabpanelId = (tabValue?: string | null) => {
    return `${uniqueId ?? "tabs"}-tabpanel-${tabValue ?? ""}`;
  };
  const selectedTabElement = tabs.find(
    (tab) => tab.props.value === selectedTab
  );

  return (
    <StackLayout gap={0} id={id}>
      <TabstripNext
        {...props}
        selectedTab={selectedTab}
        onSelectTab={(e, tab) => {
          setSelectedTab(tab);
          onSelectTabProp?.(e, tab);
        }}
      >
        {tabs.map((tabPanel) => {
          const label = tabPanel.props.label;
          return (
            <TabNext
              value={tabPanel.props.value}
              aria-controls={getTabpanelId(selectedTab)}
              label={label}
              id={getTabId(tabPanel)}
            >
              {label}
            </TabNext>
          );
        })}
      </TabstripNext>
      {typeof selectedTab === "string" && selectedTabElement
        ? cloneElement(selectedTabElement, {
            id: getTabpanelId(selectedTab),
            "aria-labelledby": getTabId(selectedTabElement),
          })
        : null}
    </StackLayout>
  );
};

import { Children, isValidElement, ReactElement, ReactNode } from "react";
import { StackLayout, useControlled } from "@salt-ds/core";
import { TabNext, TabstripNext, TabstripNextProps } from "./TabstripNext";
import { TabPanel } from "../tabs/TabPanel";

export type TabsNextProps = TabstripNextProps;

type TabElement = ReactElement<{ label: string }>;
function isTabPanel(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === TabPanel;
}

export const TabsNext = ({
  children,
  activeTabIndex: activeTabIndexProp,
  defaultActiveTabIndex,
  onActiveChange,
  ...props
}: TabsNextProps) => {
  const [activeTabIndex, setActiveTabIndex] = useControlled({
    controlled: activeTabIndexProp,
    default: defaultActiveTabIndex,
    name: "useTabs",
    state: "activeTabIndex",
  });
  const tabs = Children.toArray(children).filter(isTabPanel);

  return (
    <StackLayout>
      <TabstripNext
        {...props}
        activeTabIndex={activeTabIndex}
        onActiveChange={(index) => {
          setActiveTabIndex(index);
          onActiveChange?.(index);
        }}
      >
        {tabs.map((tab) => {
          return <TabNext label={tab.props.label}>{tab.props.label}</TabNext>;
        })}
      </TabstripNext>
      {tabs.map((tab) => {
        return <TabPanel label={tab.props.label}>{tab.props.label}</TabPanel>;
      })}
    </StackLayout>
  );
};

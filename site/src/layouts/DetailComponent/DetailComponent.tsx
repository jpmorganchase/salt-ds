import React, { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TableOfContents,
  Sidebar,
} from "@jpmorganchase/mosaic-site-components";
import { useRoute, useStore, SiteState } from "@jpmorganchase/mosaic-store";
import { TabPanel, Tabs } from "@salt-ds/lab";
import { LayoutProps } from "../types/index";
import { DetailBase } from "../DetailBase";

const tabs = [
  { id: 0, name: "examples", label: "Examples" },
  { id: 1, name: "usage", label: "How to use" },
  { id: 2, name: "accessibility", label: "Accessibility" },
];

type CustomSiteState = SiteState & { data?: Record<string, any> };

export const DetailComponent: FC<LayoutProps> = ({ children }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const { push } = useRouter();
  const { route } = useRoute();

  const useData = useStore((state: CustomSiteState) => state.data);

  const { descriptionRef } = useData || {};

  useEffect(() => {
    // update tab when the route changes
    if (route) {
      const currentTab = tabs.find(({ name }) => route.includes(name));

      currentTab ? setActiveTabIndex(currentTab.id) : setActiveTabIndex(0);
    }
  }, [route]);

  useEffect(() => {
    // update route then the tab changes
    if (route) {
      // remove everything from the last slash onwards
      const newRoute = route.substring(0, route.lastIndexOf("/") + 1);

      const currentTab = tabs.find(({ id }) => activeTabIndex === id);

      currentTab
        ? push(`${newRoute}${currentTab.name}`)
        : push(`${newRoute}${tabs[0].name}`);
    }
  }, [route, activeTabIndex]);

  const SecondarySidebar = <TableOfContents />; // TODO: replace with custom component pages sidebar

  return (
    <DetailBase sidebar={<Sidebar sticky>{SecondarySidebar}</Sidebar>}>
      <p>{descriptionRef}</p>
      <Tabs activeTabIndex={activeTabIndex} onActiveChange={setActiveTabIndex}>
        {tabs.map(({ id, label }) => (
          <TabPanel key={id} label={label}>
            {children}
          </TabPanel>
        ))}
      </Tabs>
    </DetailBase>
  );
};

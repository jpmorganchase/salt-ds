import React, { FC, useCallback } from "react";
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
  const { push } = useRouter();
  const { route } = useRoute();

  const newRoute = route?.substring(0, route.lastIndexOf("/") + 1);

  const useData = useStore((state: CustomSiteState) => state.data);

  const { description } = useData || {};

  const updateRouteWhenTabChanges = useCallback((index: number) => {
    const currentTab = tabs.find(({ id }) => index === id);

    currentTab
      ? push(`${newRoute}${currentTab.name}`)
      : push(`${newRoute}${tabs[0].name}`);
  }, []);

  const updateTabWhenRouteChanges = useCallback(() => {
    const currentTab = tabs.find(({ name }) => route?.includes(name));

    const defaultTabAndRoute = () => {
      push(`${newRoute}${tabs[0].name}`);
      return 0;
    };

    return currentTab ? currentTab.id : defaultTabAndRoute();
  }, [route]);

  const SecondarySidebar = <TableOfContents />; // TODO: replace with custom component pages sidebar

  return (
    <DetailBase sidebar={<Sidebar sticky>{SecondarySidebar}</Sidebar>}>
      <p>{description}</p>
      <Tabs
        activeTabIndex={updateTabWhenRouteChanges()}
        onActiveChange={updateRouteWhenTabChanges}
      >
        {tabs.map(({ id, label }) => (
          <TabPanel key={id} label={label}>
            {children}
          </TabPanel>
        ))}
      </Tabs>
    </DetailBase>
  );
};

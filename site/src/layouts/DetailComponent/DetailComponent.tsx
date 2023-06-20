import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  TableOfContents,
} from "@jpmorganchase/mosaic-site-components";
import {
  useRoute,
  useStore,
  SiteState,
  useMeta,
} from "@jpmorganchase/mosaic-store";
import { TabPanel, Tabs } from "@salt-ds/lab";
import { LayoutProps } from "../types/index";
import { DetailBase } from "../DetailBase";
import SecondarySidebar from "./SecondarySidebar";
import TitleWithDrawer from "./TitleWithDrawer";
import MobileDrawer from "./MobileDrawer";
import useIsMobileView from "../../utils/useIsMobileView";
import { AllExamplesViewContext } from "../../utils/useAllExamplesView";

const tabs = [
  { id: 0, name: "examples", label: "Examples" },
  { id: 1, name: "usage", label: "How to use" },
  { id: 2, name: "accessibility", label: "Accessibility" },
];

export type Relationship = "similarTo" | "contains";

type RelatedComponent = {
  name: string;
  relationship: Relationship;
};

export type Data = {
  description: string;
  alsoKnownAs: string[];
  relatedComponents: RelatedComponent[];
  sourceCodeUrl: string;
  componentGuide: string;
  bugReport: string;
  featureRequest: string;
  askQuestion: string;
};

type CustomSiteState = SiteState & { data?: Data };

export const DetailComponent: FC<LayoutProps> = ({ children }) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const { push } = useRouter();
  const { route } = useRoute();

  const [allExamplesView, setAllExamplesView] = useState(false);

  const newRoute = route?.substring(0, route.lastIndexOf("/") + 1);

  const useData = useStore((state: CustomSiteState) => state.data);

  const { description } = useData || {};

  const currentTab = tabs.find(({ name }) => route?.includes(name));

  useEffect(() => {
    if (!currentTab) {
      push(`${newRoute}${tabs[0].name}`);
    }
  }, [route]);

  const isMobileView = useIsMobileView();

  const updateRouteWhenTabChanges = (index: number) => {
    const currentTab = tabs.find(({ id }) => index === id);

    currentTab
      ? push(`${newRoute}${currentTab.name}`)
      : push(`${newRoute}${tabs[0].name}`);
  };

  const currentTabIndex = currentTab?.id ?? 0;

  const {
    meta: { title },
  } = useMeta();

  return (
    <AllExamplesViewContext.Provider
      value={{ allExamplesView, setAllExamplesView }}
    >
      <DetailBase
        sidebar={
          <Sidebar sticky>
            {
              <SecondarySidebar
                additionalData={useData}
                tableOfContents={<TableOfContents />}
              />
            }
          </Sidebar>
        }
        title={
          isMobileView ? (
            <TitleWithDrawer
              title={title}
              openDrawer={openDrawer}
              setOpenDrawer={setOpenDrawer}
            />
          ) : undefined
        }
      >
        <MobileDrawer
          open={openDrawer}
          drawerContent={<SecondarySidebar additionalData={useData} />}
        />
        <p>{description}</p>
        <Tabs
          activeTabIndex={currentTabIndex}
          onActiveChange={updateRouteWhenTabChanges}
        >
          {tabs.map(({ id, label }) => (
            <TabPanel key={id} label={label}>
              {children}
            </TabPanel>
          ))}
        </Tabs>
      </DetailBase>
    </AllExamplesViewContext.Provider>
  );
};

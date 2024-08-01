import { Sidebar } from "@jpmorganchase/mosaic-site-components";
import {
  type SiteState,
  useMeta,
  useRoute,
  useStore,
} from "@jpmorganchase/mosaic-store";
import { TabPanel, Tabs } from "@salt-ds/lab";
import { useRouter } from "next/navigation";
import React, { type FC, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { code, p, ul } from "../../components";
import { TableOfContents } from "../../components/toc";
import { AllExamplesViewContext } from "../../utils/useAllExamplesView";
import useIsMobileView from "../../utils/useIsMobileView";
import { DetailBase } from "../DetailBase";
import type { LayoutProps } from "../types/index";
import styles from "./DetailComponent.module.css";
import MobileDrawer from "./MobileDrawer";
import SecondarySidebar from "./SecondarySidebar";
import TitleWithDrawer from "./TitleWithDrawer";

const components = { code, ul, p };

const tabs = [
  { id: 0, name: "examples", label: "Examples" },
  { id: 1, name: "usage", label: "How to use" },
  { id: 2, name: "accessibility", label: "Accessibility" },
];

export type Relationship = "similarTo" | "contains";

interface RelatedComponent {
  name: string;
  relationship: Relationship;
}

interface ComponentNpmInfo {
  name: string;
  initialVersion?: string;
}

export interface Data {
  description: string;
  alsoKnownAs: string[];
  relatedComponents: RelatedComponent[];
  relatedPatterns: string[];
  sourceCodeUrl: string;
  package: ComponentNpmInfo;
  bugReport?: string;
  featureRequest?: string;
}

type CustomSiteState = SiteState & { data?: Data };

export const DetailComponent: FC<LayoutProps> = ({ children }) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const { replace, push } = useRouter();
  const { route } = useRoute();

  const [allExamplesView, setAllExamplesView] = useState(false);

  const newRoute = route?.substring(0, route.lastIndexOf("/") + 1);

  const useData = useStore((state: CustomSiteState) => {
    const defaultData: Partial<Data> = {
      bugReport:
        "https://github.com/jpmorganchase/salt-ds/issues/new?assignees=&labels=type%3A+bug+%F0%9F%AA%B2%2Cstatus%3A+awaiting+triage&template=bug_report.yml",
      featureRequest:
        "https://github.com/jpmorganchase/salt-ds/issues/new?assignees=&labels=type%3A+enhancement+%F0%9F%92%A1%2Cstatus%3A+awaiting+triage&template=feature_request.yml",
    };

    return state.data ? { ...defaultData, ...state.data } : undefined;
  });

  const { description } = useData ?? {};

  const currentTab = tabs.find(({ name }) => route?.includes(name));

  useEffect(() => {
    // Default to first tab, "Examples"
    if (!currentTab) {
      replace(`${newRoute}${tabs[0].name}`);
    }
  }, [currentTab, newRoute, replace, route]);

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
          !isMobileView ? (
            <Sidebar sticky>
              {
                <SecondarySidebar
                  additionalData={useData}
                  tableOfContents={<TableOfContents />}
                />
              }
            </Sidebar>
          ) : undefined
        }
        pageTitle={
          isMobileView ? (
            <TitleWithDrawer
              title={title}
              openDrawer={openDrawer}
              setOpenDrawer={setOpenDrawer}
            />
          ) : undefined
        }
        isMobileView={isMobileView}
      >
        {isMobileView && (
          <MobileDrawer
            open={openDrawer}
            drawerContent={<SecondarySidebar additionalData={useData} />}
          />
        )}
        <ReactMarkdown components={components}>
          {description ?? ""}
        </ReactMarkdown>
        <Tabs
          activeTabIndex={currentTabIndex}
          onActiveChange={updateRouteWhenTabChanges}
        >
          {tabs.map(({ id, label }) => (
            <TabPanel key={id} label={label} className={styles.tabPanel}>
              {children}
            </TabPanel>
          ))}
        </Tabs>
      </DetailBase>
    </AllExamplesViewContext.Provider>
  );
};

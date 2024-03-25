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
import ReactMarkdown from "react-markdown";
import { LayoutProps } from "../types/index";
import { DetailBase } from "../DetailBase";
import SecondarySidebar from "./SecondarySidebar";
import TitleWithDrawer from "./TitleWithDrawer";
import MobileDrawer from "./MobileDrawer";
import useIsMobileView from "../../utils/useIsMobileView";
import { AllExamplesViewContext } from "../../utils/useAllExamplesView";
import styles from "./DetailComponent.module.css";
import { code, p, ul } from "../../components";

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
  initialRelease?: string;
}

export interface Data {
  description: string;
  alsoKnownAs: string[];
  relatedComponents: RelatedComponent[];
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

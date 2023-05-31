import React, {
  FC,
  useEffect,
  createContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@jpmorganchase/mosaic-site-components";
import { useRoute, useStore, SiteState } from "@jpmorganchase/mosaic-store";
import { TabPanel, Tabs } from "@salt-ds/lab";
import { LayoutProps } from "../types/index";
import { DetailBase } from "../DetailBase";
import SecondarySidebar from "./SecondarySidebar";

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

export type AllExamplesViewContextType = {
  allExamplesView?: boolean;
  setAllExamplesView: Dispatch<SetStateAction<boolean>>;
};

export const AllExamplesViewContext = createContext<AllExamplesViewContextType>(
  { allExamplesView: false, setAllExamplesView: () => {} }
);

export const DetailComponent: FC<LayoutProps> = ({ children }) => {
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

  const updateRouteWhenTabChanges = (index: number) => {
    const currentTab = tabs.find(({ id }) => index === id);

    currentTab
      ? push(`${newRoute}${currentTab.name}`)
      : push(`${newRoute}${tabs[0].name}`);
  };

  const currentTabIndex = currentTab?.id ?? 0;

  return (
    <AllExamplesViewContext.Provider
      value={{ allExamplesView, setAllExamplesView }}
    >
      <DetailBase
        sidebar={
          <Sidebar sticky>
            {<SecondarySidebar additionalData={useData} />}
          </Sidebar>
        }
      >
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

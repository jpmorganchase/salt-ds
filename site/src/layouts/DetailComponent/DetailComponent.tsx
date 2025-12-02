import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import {
  type SiteState,
  useRoute,
  useStore,
} from "@jpmorganchase/mosaic-store";
import {
  TabBar,
  type TabListNextProps,
  TabNext,
  TabNextPanel,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { type SyntheticEvent, useEffect } from "react";
import { LivePreviewProvider } from "../../components/components/LivePreviewProvider";
import { LinkList } from "../../components/link-list/LinkList";
import { PageNavigation } from "../../components/navigation/PageNavigation";
import { TableOfContents } from "../../components/toc/index";
import { getHrefFromComponent } from "../../utils/getHrefFromComponent";
import { Base } from "../Base/Base";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { SecondarySidebar } from "../Base/SecondarySidebar";
import { RelatedPatterns } from "../DetailPattern/RelatedPatterns";
import styles from "./DetailComponent.module.css";

const tabs = [
  { name: "examples", label: "Examples" },
  { name: "usage", label: "How to use" },
  { name: "accessibility", label: "Accessibility" },
];

export type Relationship = "similarTo" | "contains";

const TabListNext = dynamic<TabListNextProps>(() =>
  import("@salt-ds/lab").then((mod) => mod.TabListNext),
);

interface RelatedComponent {
  name: string;
  relationship: Relationship;
}

interface ComponentNpmInfo {
  name: string;
  initialVersion?: string;
}

interface ExternalDependency {
  name: string;
  compatibleVersions?: string;
  licenseRequired?: boolean;
  url?: string;
}

export interface Data {
  description?: string;
  alsoKnownAs?: string[];
  relatedComponents?: RelatedComponent[];
  relatedPatterns?: string[];
  sourceCodeUrl?: string;
  figmaUrl?: string;
  package?: ComponentNpmInfo;
  bugReport?: string;
  featureRequest?: string;
  status?: string;
  externalDependency?: ExternalDependency;
}

export type CustomSiteState = SiteState & { data?: Data };

function getRelatedComponentLinks(
  relatedComponents: Data["relatedComponents"],
  relationship: Relationship,
) {
  return (
    relatedComponents
      ?.filter((component) => component.relationship === relationship)
      .map((component) => ({
        href: getHrefFromComponent(component.name),
        label: component.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) ?? []
  );
}

const ComponentPageHeading = dynamic(() => import("./ComponentPageHeading"));

export const DetailComponent = ({ children }: LayoutProps) => {
  const { replace, push } = useRouter();
  const { route } = useRoute();

  const newRoute = route?.substring(0, route.lastIndexOf("/") + 1);

  const { relatedComponents } = useStore(
    (state: CustomSiteState) => state.data ?? {},
  );

  const isOverview = route?.endsWith("components/index");

  const currentTab = tabs.find(({ name }) => route?.includes(name));

  useEffect(() => {
    // Default to first tab, "Examples"
    if (!currentTab && !isOverview) {
      replace(`${newRoute}${tabs[0].name}`);
    }
  }, [currentTab, newRoute, replace, isOverview]);

  const handleTabChange = (_: SyntheticEvent | null, value: string) => {
    push(`${newRoute}${value}`, undefined, { scroll: false });
  };

  const LeftSidebar = (
    <PrimarySidebar className={styles.primarySidebar}>
      <PageNavigation />
    </PrimarySidebar>
  );

  const similarToLinks = getRelatedComponentLinks(
    relatedComponents,
    "similarTo",
  );
  const containsList = getRelatedComponentLinks(relatedComponents, "contains");

  const RightSidebar = (
    <SecondarySidebar>
      <TableOfContents />
      {similarToLinks.length > 0 ||
        (containsList.length > 0 && (
          <div className={styles.sidebarSection}>
            <LinkList heading="Similar to" links={similarToLinks} />
            <LinkList heading="Contains" links={containsList} />
          </div>
        ))}
      <RelatedPatterns />
    </SecondarySidebar>
  );

  return (
    <LivePreviewProvider>
      <Base
        className={styles.root}
        LeftSidebar={LeftSidebar}
        RightSidebar={RightSidebar}
        Heading={ComponentPageHeading}
      >
        {isOverview ? children : undefined}
        {!isOverview && (
          <TabsNext
            className={styles.content}
            value={currentTab?.name ?? tabs[0].name}
            onChange={handleTabChange}
          >
            <TabBar divider>
              <TabListNext appearance="transparent">
                {tabs.map(({ name, label }) => (
                  <TabNext key={name} value={name}>
                    <TabNextTrigger>{label}</TabNextTrigger>
                  </TabNext>
                ))}
              </TabListNext>
            </TabBar>
            {tabs.map(({ name }) => (
              <TabNextPanel className={styles.tabPanel} key={name} value={name}>
                {children}
              </TabNextPanel>
            ))}
          </TabsNext>
        )}
      </Base>
    </LivePreviewProvider>
  );
};

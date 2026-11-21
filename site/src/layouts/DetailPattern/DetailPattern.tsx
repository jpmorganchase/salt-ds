import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import {
  type SiteState,
  useRoute,
  useStore,
} from "@jpmorganchase/mosaic-store";
import {
  Tab,
  TabBar,
  TabList,
  TabPanel,
  Tabs,
  TabTrigger,
} from "@salt-ds/core";
import { useRouter } from "next/router";
import type { FC, ReactNode } from "react";
import { LivePreviewProvider } from "../../components";
import { ThemeControls } from "../../components/components/ThemeControls";
import { CTALink } from "../../components/cta-link/CTALink";
import { Image } from "../../components/mdx/image";
import { PageNavigation } from "../../components/navigation/PageNavigation";
import { TableOfContents } from "../../components/toc";
import { Base } from "../Base/index";
import { PageHeading, type PageHeadingProps } from "../Base/PageHeading";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { SecondarySidebar } from "../Base/SecondarySidebar";
import { Components } from "./Components";
import styles from "./DetailPattern.module.css";
import { RelatedPatterns } from "./RelatedPatterns";
import { Resources } from "./Resources";

type ResourcesArray = {
  href: string;
  label: string;
  internal?: boolean;
}[];

type Data = {
  resources: ResourcesArray;
  showThemeControl?: boolean;
  patternUrl?: string;
};

type CustomSiteState = SiteState & { data?: Data };

function PatternPageHeading({
  title,
  description,
  id,
}: PageHeadingProps): JSX.Element {
  const resourcesArray =
    useStore((state: CustomSiteState) => state.data?.resources) ?? [];
  const showThemeControl =
    useStore((state: CustomSiteState) => state.data?.showThemeControl) ?? false;

  const exampleLink = resourcesArray.filter((resource) =>
    resource.href.startsWith("https://storybook.saltdesignsystem.com"),
  )[0];

  return (
    <PageHeading title={title} description={description} id={id}>
      <div className={styles.headingActions}>
        {exampleLink && (
          <CTALink
            sentiment="neutral"
            href={exampleLink.href}
            aria-label="View Example"
          >
            <Image
              className={styles.SBLogo}
              noMargin
              src="/img/storybook_logo.svg"
              alt={""}
              aria-hidden
            />{" "}
            View Example
          </CTALink>
        )}
        {showThemeControl && <ThemeControls scope="pattern" />}
      </div>
    </PageHeading>
  );
}

function PatternTabs({
  patternUrl,
  children,
}: {
  patternUrl: string;
  children: ReactNode;
}) {
  const { route } = useRoute();
  const { push } = useRouter();
  const examplesUrl = `${patternUrl}/examples`;
  const currentTab = route?.replace(/\/$/, "").endsWith("/examples")
    ? "examples"
    : "guidance";

  return (
    <Tabs
      className={styles.tabs}
      value={currentTab}
      onChange={(_event, value) => {
        void push(value === "examples" ? examplesUrl : patternUrl, undefined, {
          scroll: false,
        });
      }}
    >
      <TabBar divider>
        <TabList appearance="transparent" aria-label="Pattern documentation">
          <Tab value="guidance">
            <TabTrigger>Guidance</TabTrigger>
          </Tab>
          <Tab value="examples">
            <TabTrigger>Examples</TabTrigger>
          </Tab>
        </TabList>
      </TabBar>
      {["guidance", "examples"].map((value) => (
        <TabPanel className={styles.tabPanel} key={value} value={value}>
          {value === currentTab ? children : null}
        </TabPanel>
      ))}
    </Tabs>
  );
}

export const DetailPattern: FC<LayoutProps> = ({ children }) => {
  const patternUrl = useStore(
    (state: CustomSiteState) => state.data?.patternUrl,
  );
  const LeftSidebar = (
    <PrimarySidebar>
      <PageNavigation />
    </PrimarySidebar>
  );

  const RightSidebar = (
    <SecondarySidebar>
      <TableOfContents />
      <Components />
      <RelatedPatterns />
      <Resources />
    </SecondarySidebar>
  );

  return (
    <LivePreviewProvider>
      <Base
        LeftSidebar={LeftSidebar}
        RightSidebar={RightSidebar}
        Heading={PatternPageHeading}
      >
        {patternUrl ? (
          <PatternTabs patternUrl={patternUrl}>{children}</PatternTabs>
        ) : (
          children
        )}
      </Base>
    </LivePreviewProvider>
  );
};

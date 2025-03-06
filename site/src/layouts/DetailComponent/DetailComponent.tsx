import { PageNavigation } from "@jpmorganchase/mosaic-site-components";
import {
  type SiteState,
  useRoute,
  useStore,
} from "@jpmorganchase/mosaic-store";
import {
  Button,
  Divider,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { GithubIcon, SaltShakerIcon } from "@salt-ds/icons";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextPanel,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import { useRouter } from "next/navigation";
import { type FC, type SyntheticEvent, useEffect } from "react";
import {
  LivePreviewProvider,
  useLivePreviewControls,
} from "../../components/components/LivePreviewProvider";
import { CTALink } from "../../components/cta-link/CTALink";
import { TopLevelNavigation } from "../../components/navigation/TopLevelNavigation";
import { TableOfContents } from "../../components/toc/index";
import { Base } from "../Base";
import { PageHeading } from "../Base/PageHeading";
import type { LayoutProps } from "../types";
import styles from "./DetailComponent.module.css";
import SecondarySidebar from "./SecondarySidebar";

const tabs = [
  { name: "examples", label: "Examples" },
  { name: "usage", label: "How to use" },
  { name: "accessibility", label: "Accessibility" },
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
  description?: string;
  alsoKnownAs?: string[];
  relatedComponents?: RelatedComponent[];
  relatedPatterns?: string[];
  sourceCodeUrl?: string;
  package?: ComponentNpmInfo;
  bugReport?: string;
  featureRequest?: string;
}

type CustomSiteState = SiteState & { data?: Data };

function useComponentData(): Data {
  return useStore((state: CustomSiteState) => ({ ...state.data }));
}

function ThemeControls() {
  const { density, mode, theme, setDensity, setMode, setTheme } =
    useLivePreviewControls();

  return (
    <StackLayout gap={1} padding={1}>
      <StackLayout gap={0.75} align="baseline" padding={0}>
        <Text styleAs="label" color="secondary">
          <strong>Density</strong>
        </Text>
        <ToggleButtonGroup
          className={styles.toggleGroup}
          aria-label="Select density"
          value={density}
          onChange={(event) => setDensity(event.currentTarget.value as any)}
        >
          <ToggleButton value="high">High</ToggleButton>
          <ToggleButton value="medium">Medium</ToggleButton>
          <ToggleButton value="low">Low</ToggleButton>
          <ToggleButton value="touch">Touch</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
      <StackLayout gap={0.75} align="baseline" padding={0}>
        <Text styleAs="label" color="secondary">
          <strong>Mode</strong>
        </Text>
        <ToggleButtonGroup
          className={styles.toggleGroup}
          aria-label="Select mode"
          onChange={(event) => setMode(event.currentTarget.value as any)}
          value={mode}
        >
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
      <StackLayout gap={0.75} align="baseline" padding={0}>
        <Text styleAs="label" color="secondary">
          <strong>Themes</strong>
        </Text>

        <ToggleButtonGroup
          className={styles.toggleGroup}
          aria-label="Select themes"
          onChange={(event) => setTheme(event.currentTarget.value as any)}
          value={theme}
        >
          <ToggleButton value="legacy">Legacy</ToggleButton>
          <ToggleButton value="brand">JPM Brand</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
}

function ComponentPageHeading({ title }: { title?: string }) {
  const { description, sourceCodeUrl, alsoKnownAs = [] } = useComponentData();

  return (
    <PageHeading title={title} description={description}>
      {alsoKnownAs.length > 0 && (
        <Text>
          Also known as: <small>{alsoKnownAs.join(", ")}</small>
        </Text>
      )}

      {sourceCodeUrl && (
        <div className={styles.headingActions}>
          <CTALink
            appearance="bordered"
            sentiment="neutral"
            href={sourceCodeUrl}
          >
            <GithubIcon aria-hidden /> View source code
          </CTALink>
        </div>
      )}
    </PageHeading>
  );
}

export const DetailComponent: FC<LayoutProps> = ({ children }) => {
  const { replace, push } = useRouter();
  const { route } = useRoute();

  const newRoute = route?.substring(0, route.lastIndexOf("/") + 1);

  const additionalData = useComponentData();

  const isOverview = route?.endsWith("components/index");

  const currentTab = tabs.find(({ name }) => route?.includes(name));

  useEffect(() => {
    // Default to first tab, "Examples"
    if (!currentTab && !isOverview) {
      replace(`${newRoute}${tabs[0].name}`);
    }
  }, [currentTab, newRoute, replace, isOverview]);

  const handleTabChange = (_: SyntheticEvent | null, value: string) => {
    push(`${newRoute}${value}`);
  };

  const PrimarySidebar = (
    <div className={styles.primarySidebar}>
      <div className={styles.sidebarExtras}>
        <Overlay>
          <OverlayTrigger>
            <Button sentiment="neutral" appearance="solid">
              <SaltShakerIcon aria-hidden /> Theme Options
            </Button>
          </OverlayTrigger>
          <OverlayPanel>
            <OverlayPanelContent>
              <ThemeControls />
            </OverlayPanelContent>
          </OverlayPanel>
        </Overlay>
      </div>
      <Divider variant="tertiary" />
      <TopLevelNavigation />
      <Divider variant="tertiary" />
      <div className={styles.navigation}>
        <PageNavigation />
      </div>
    </div>
  );

  const RightSidebar = (
    <div className={styles.secondarySidebar}>
      <SecondarySidebar
        additionalData={additionalData}
        tableOfContents={<TableOfContents />}
      />
    </div>
  );

  return (
    <LivePreviewProvider>
      <Base
        LeftSidebar={PrimarySidebar}
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
            <TabBar className={styles.tabBar} divider>
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

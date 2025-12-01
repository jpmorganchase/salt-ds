import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import { type SiteState, useStore } from "@jpmorganchase/mosaic-store";
import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import { SettingsSolidIcon } from "@salt-ds/icons";
import type { FC } from "react";
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
            appearance="bordered"
            sentiment="neutral"
            href={exampleLink.href}
            aria-label="View Example"
          >
            <Image src="/img/storybook_logo.svg" alt={""} aria-hidden /> View
            Example
          </CTALink>
        )}
        {showThemeControl && (
          <Overlay>
            <OverlayTrigger>
              <Button
                sentiment="neutral"
                appearance="bordered"
                aria-label="Theme Controls"
              >
                <SettingsSolidIcon aria-hidden />
              </Button>
            </OverlayTrigger>
            <OverlayPanel className={styles.overlay}>
              <OverlayPanelContent>
                <ThemeControls />
              </OverlayPanelContent>
            </OverlayPanel>
          </Overlay>
        )}
      </div>
    </PageHeading>
  );
}

export const DetailPattern: FC<LayoutProps> = ({ children }) => {
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
        {children}
      </Base>
    </LivePreviewProvider>
  );
};

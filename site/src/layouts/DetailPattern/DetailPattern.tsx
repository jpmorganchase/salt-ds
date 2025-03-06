import { Image, PageNavigation } from "@jpmorganchase/mosaic-site-components";
import { type SiteState, useStore } from "@jpmorganchase/mosaic-store";
import { Divider, Tooltip } from "@salt-ds/core";
import type { FC } from "react";
import { CTALink } from "../../components/cta-link/CTALink";
import { TableOfContents } from "../../components/toc";
import { PageHeading } from "../Base/PageHeading";
import { Base } from "../Base/index";
import type { LayoutProps } from "../types/index";
import { Components } from "./Components";
import styles from "./DetailPattern.module.css";
import { RelatedPatterns } from "./RelatedPatterns";
import { Resources } from "./Resources";
import { TopLevelNavigation } from "../../components/navigation/TopLevelNavigation";

type ResourcesArray = {
  href: string;
  label: string;
  internal?: boolean;
}[];

type Data = {
  resources: ResourcesArray;
};

type CustomSiteState = SiteState & { data?: Data };

function PatternPageHeading({
  title,
  description,
}: { title?: string; description?: string }) {
  const resourcesArray =
    useStore((state: CustomSiteState) => state.data?.resources) ?? [];

  const exampleLink = resourcesArray.filter((resource) =>
    resource.href.startsWith("https://storybook.saltdesignsystem.com"),
  )[0];

  return (
    <PageHeading title={title} description={description}>
      <div className={styles.headingActions}>
        {exampleLink && (
          <Tooltip content="View Example" placement="bottom">
            <CTALink
              appearance="bordered"
              sentiment="neutral"
              href={exampleLink.href}
              aria-label="View Example"
            >
              <Image src="/img/storybook_logo.svg" alt={""} aria-hidden />
            </CTALink>
          </Tooltip>
        )}
      </div>
    </PageHeading>
  );
}

export const DetailPattern: FC<LayoutProps> = ({ children }) => {
  const PrimarySidebar = (
    <div className={styles.primarySidebar}>
      <TopLevelNavigation />
      <Divider variant="tertiary" />
      <PageNavigation />
    </div>
  );

  const RightSidebar = (
    <div className={styles.secondarySidebar}>
      <TableOfContents />
      <Components />
      <RelatedPatterns />
      <Resources />
    </div>
  );

  return (
    <Base
      LeftSidebar={PrimarySidebar}
      RightSidebar={RightSidebar}
      Heading={PatternPageHeading}
    >
      {children}
    </Base>
  );
};

import type { LayoutProps } from "@jpmorganchase/mosaic-layouts/dist/types";
import { Image, PageNavigation } from "@jpmorganchase/mosaic-site-components";
import { type SiteState, useStore } from "@jpmorganchase/mosaic-store";
import { Divider } from "@salt-ds/core";
import type { FC } from "react";
import { CTALink } from "../../components/cta-link/CTALink";
import { TopLevelNavigation } from "../../components/navigation/TopLevelNavigation";
import { TableOfContents } from "../../components/toc";
import { PageHeading } from "../Base/PageHeading";
import { PrimarySidebar } from "../Base/PrimarySidebar";
import { SecondarySidebar } from "../Base/SecondarySidebar";
import { Base } from "../Base/index";
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
      </div>
    </PageHeading>
  );
}

export const DetailPattern: FC<LayoutProps> = ({ children }) => {
  const LeftSidebar = (
    <PrimarySidebar>
      <TopLevelNavigation />
      <Divider variant="tertiary" />
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
    <Base
      LeftSidebar={LeftSidebar}
      RightSidebar={RightSidebar}
      Heading={PatternPageHeading}
    >
      {children}
    </Base>
  );
};

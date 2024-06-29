import { HelpLinks } from "@jpmorganchase/mosaic-components";
import { LayoutBase } from "@jpmorganchase/mosaic-layouts";
import {
  BackLink,
  Breadcrumbs,
  DocPaginator,
  PageNavigation,
} from "@jpmorganchase/mosaic-site-components";
import { type SiteState, useMeta, useStore } from "@jpmorganchase/mosaic-store";
import { FlexLayout, H1, SaltProvider } from "@salt-ds/core";
import clsx from "clsx";
import type { FC, ReactElement } from "react";
import { AppHeader } from "../../components/app-header";
import { Footer } from "../../components/footer";
import { StatusPill } from "../../components/status-pill";
import { LayoutColumns } from "../LayoutColumns/LayoutColumns";
import layoutStyles from "../index.module.css";
import type { LayoutProps } from "../types/index";
import styles from "./DetailBase.module.css";

interface Data {
  status: string;
}

type CustomSiteState = SiteState & { data?: Data };

interface PageHeadingWithPillProps {
  title?: string | ReactElement;
  pageStatus: string;
  isMobileView?: boolean;
}

const PageHeadingWithPill: FC<PageHeadingWithPillProps> = ({
  title,
  pageStatus,
  isMobileView,
}) => (
  <FlexLayout
    className={styles.headingContainer}
    direction={isMobileView ? "column" : "row"}
    align={isMobileView ? "start" : "center"}
    gap={isMobileView ? 0 : 1}
  >
    <H1>{title}</H1>
    {pageStatus && <StatusPill label={pageStatus} />}
  </FlexLayout>
);

export const DetailBase: FC<LayoutProps> = ({
  BackLinkProps,
  FooterProps,
  SidebarProps,
  children,
  sidebar,
  pageTitle: titleProp,
  isMobileView,
}) => {
  const Header = <AppHeader />;

  const PrimarySidebar = (
    <div className={styles.primarySidebar}>
      {BackLinkProps && (
        <header className={styles.sidebarHeader}>
          <BackLink {...BackLinkProps} />
        </header>
      )}
      <PageNavigation />
      {SidebarProps?.helpLinks && (
        <HelpLinks subTitle="Need help?" {...SidebarProps.helpLinks} />
      )}
    </div>
  );

  const {
    meta: { title },
  } = useMeta();

  const pageStatus = useStore((state: CustomSiteState) => state.data?.status);

  const pageTitle = titleProp ? titleProp : title;

  return (
    <LayoutBase Header={Header} className={layoutStyles.base}>
      <div className={clsx(layoutStyles.docsWrapper, styles.docsWrapper)}>
        <LayoutColumns PrimarySidebar={PrimarySidebar}>
          <Breadcrumbs />
          {pageStatus ? (
            <PageHeadingWithPill
              title={pageTitle}
              pageStatus={pageStatus}
              isMobileView={isMobileView}
            />
          ) : (
            <H1 styleAs="display2" className={layoutStyles.title}>
              {pageTitle}
            </H1>
          )}
          <SaltProvider mode="light">
            <div className={layoutStyles.docsPageContainer}>
              <div
                className={clsx(
                  layoutStyles.docsPageContent,
                  styles.docsPageContent,
                )}
              >
                {children}
              </div>
              <SaltProvider density="medium" applyClassesTo="child">
                <div className={styles.sidebar}>{sidebar}</div>
              </SaltProvider>
            </div>
          </SaltProvider>
          <div className={styles.docPaginator}>
            <DocPaginator />
          </div>
        </LayoutColumns>
      </div>
      <Footer {...FooterProps} />
    </LayoutBase>
  );
};

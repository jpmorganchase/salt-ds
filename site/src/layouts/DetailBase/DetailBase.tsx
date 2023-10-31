import React, { FC, ReactElement } from "react";
import clsx from "clsx";
import { HelpLinks } from "@jpmorganchase/mosaic-components";
import {
  DocPaginator,
  BackLink,
  Breadcrumbs,
} from "@jpmorganchase/mosaic-site-components";
import { useStore, SiteState } from "@jpmorganchase/mosaic-store";
import { Footer } from "../../components/footer";
import { AppHeader } from "../../components/app-header";
import { PageNavigation } from "../../components";
import { LayoutBase } from "@jpmorganchase/mosaic-layouts";
import { StatusPill } from "../../components/status-pill";
import { LayoutColumns } from "../LayoutColumns/LayoutColumns";
import { SaltProvider } from "@salt-ds/core";
import { useMeta } from "@jpmorganchase/mosaic-store";
import { LayoutProps } from "../types/index";
import layoutStyles from "../index.module.css";
import styles from "./DetailBase.module.css";

type Data = {
  status: string;
};

type CustomSiteState = SiteState & { data?: Data };

type PageHeadingWithPillProps = {
  title?: string | ReactElement;
  pageStatus: string;
};

const PageHeadingWithPill: FC<PageHeadingWithPillProps> = ({
  title,
  pageStatus,
}) => (
  <div className={styles.headingContainer}>
    <h1>{title}</h1>
    {pageStatus && <StatusPill label={pageStatus} />}
  </div>
);

export const DetailBase: FC<LayoutProps> = ({
  BackLinkProps,
  FooterProps,
  SidebarProps,
  children,
  sidebar,
  pageTitle: titleProp,
}) => {
  const Header = <AppHeader />;

  const PrimarySidebar = (
    <SaltProvider mode="light">
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
    </SaltProvider>
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
            <PageHeadingWithPill title={pageTitle} pageStatus={pageStatus} />
          ) : (
            <h1 className={layoutStyles.title}>{pageTitle}</h1>
          )}
          <SaltProvider mode="light">
            <div className={layoutStyles.docsPageContainer}>
              <div
                className={clsx(
                  layoutStyles.docsPageContent,
                  styles.docsPageContent
                )}
              >
                {children}
              </div>
              <div className={styles.sidebar}>
                <SaltProvider density="medium">{sidebar}</SaltProvider>
              </div>
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

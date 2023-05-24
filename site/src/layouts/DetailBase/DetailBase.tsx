import React, { FC } from "react";
import clsx from "clsx";
import { HelpLinks } from "@jpmorganchase/mosaic-components";
import {
  DocPaginator,
  BackLink,
  Breadcrumbs,
  PageNavigation,
} from "@jpmorganchase/mosaic-site-components";
import { Footer } from "../../components/footer";
import { AppHeader } from "../../components/app-header";
import { LayoutBase } from "@jpmorganchase/mosaic-layouts";
import { LayoutColumns } from "../LayoutColumns/LayoutColumns";
import { SaltProvider } from "@salt-ds/core";
import { useMeta } from "@jpmorganchase/mosaic-store";
import { LayoutProps } from "../types/index";
import layoutStyles from "../index.module.css";
import styles from "./DetailBase.module.css";

export const DetailBase: FC<LayoutProps> = ({
  BackLinkProps,
  FooterProps,
  SidebarProps,
  children,
  sidebar,
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

  return (
    <LayoutBase Header={Header} className={layoutStyles.base}>
      <div className={clsx(layoutStyles.docsWrapper, styles.docsWrapper)}>
        <LayoutColumns PrimarySidebar={PrimarySidebar}>
          <Breadcrumbs />
          <h1 className={layoutStyles.title}>{title}</h1>
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

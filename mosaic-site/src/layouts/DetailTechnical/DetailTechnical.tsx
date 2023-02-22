import React, { FC } from "react";
import { HelpLinks } from "@jpmorganchase/mosaic-components";
import {
  AppHeader,
  DocPaginator,
  BackLink,
  Breadcrumbs,
  Footer,
  TableOfContents,
  VerticalNavigation,
} from "@jpmorganchase/mosaic-site-components";
import { LayoutBase, LayoutColumns } from "@jpmorganchase/mosaic-layouts"; // TODO: create custom LayoutColumns component
import { SaltProvider } from "@salt-ds/core";
import { LayoutProps } from "../types/index";
import layoutStyles from "../index.module.css";
import styles from "./DetailTechnical.module.css";

export const DetailTechnical: FC<LayoutProps> = ({
  BackLinkProps,
  FooterProps,
  SidebarProps,
  children,
}) => {
  const Header = <AppHeader />;

  const PrimarySidebar = (
    <>
      {BackLinkProps && (
        <header className={styles.sidebarHeader}>
          <BackLink {...BackLinkProps} />
        </header>
      )}
      {/*  TODO: Add salt light theme to vertical navigation */}
      <VerticalNavigation />
      {SidebarProps?.helpLinks && (
        <HelpLinks subTitle="Need help?" {...SidebarProps.helpLinks} />
      )}
    </>
  );

  const SecondarySidebar = <TableOfContents />;

  const title = children?.props.source.frontmatter.title;

  return (
    <LayoutBase Header={Header}>
      <div className={layoutStyles.docsWrapper}>
        <LayoutColumns
          PrimarySidebar={PrimarySidebar}
          SecondarySidebar={SecondarySidebar}
          Footer={<Footer {...FooterProps} />}
        >
          <Breadcrumbs />
          <h1 className={layoutStyles.title}>{title}</h1>
          <SaltProvider mode="light">
            <div className={layoutStyles.docsPageContainer}>
              <div className={layoutStyles.docsPageContent}>{children}</div>
            </div>
          </SaltProvider>
          <DocPaginator />
        </LayoutColumns>
      </div>
    </LayoutBase>
  );
};

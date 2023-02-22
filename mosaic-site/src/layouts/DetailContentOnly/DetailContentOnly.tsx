import React from "react";
import {
  AppHeader,
  Breadcrumbs,
  Footer,
} from "@jpmorganchase/mosaic-site-components";
import { SaltProvider } from "@salt-ds/core";
import { LayoutBase } from "@jpmorganchase/mosaic-layouts";
import { LayoutFullWidth } from "../LayoutFullWidth";
import type { LayoutProps } from "../types/index";
import layoutStyles from "../index.module.css";

export const DetailContentOnly: React.FC<LayoutProps> = ({
  FooterProps,
  children,
}) => {
  const title = children?.props.source.frontmatter.title;

  return (
    <LayoutBase Header={<AppHeader />}>
      <div className={layoutStyles.docsWrapper}>
        <LayoutFullWidth Footer={<Footer {...FooterProps} />}>
          <Breadcrumbs />
          <h1 className={layoutStyles.title}>{title}</h1>
          <SaltProvider mode="light">
            <div className={layoutStyles.docsPageContainer}>
              <div className={layoutStyles.docsPageContent}>{children}</div>
            </div>
          </SaltProvider>
        </LayoutFullWidth>
      </div>
    </LayoutBase>
  );
};

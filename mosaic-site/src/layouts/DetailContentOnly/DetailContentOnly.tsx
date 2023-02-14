import React from "react";
import clsx from "clsx";
import {
  AppHeader,
  Breadcrumbs,
  Footer,
} from "@jpmorganchase/mosaic-site-components";
import { SaltProvider } from "@salt-ds/core";
import { LayoutBase, LayoutFullWidth } from "@jpmorganchase/mosaic-layouts";
import type { LayoutProps } from "../types/index";
import layoutStyles from "../index.module.css";
import styles from "./DetailContentOnly.module.css";

export const DetailContentOnly: React.FC<LayoutProps> = ({
  FooterProps,
  children,
}) => {
  const title = children?.props.source.frontmatter.title;

  return (
    <LayoutBase Header={<AppHeader />}>
      <div className={clsx(styles.docsWrapper, layoutStyles.docsWrapper)}>
        <LayoutFullWidth Footer={<Footer {...FooterProps} />}>
          <Breadcrumbs />
          <h1>{title}</h1>
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

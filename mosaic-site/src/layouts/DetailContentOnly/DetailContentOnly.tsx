import React from "react";
import { Breadcrumbs } from "@jpmorganchase/mosaic-site-components";
import { Footer, AppHeader } from "../../components";
import { SaltProvider } from "@salt-ds/core";
import { LayoutBase } from "@jpmorganchase/mosaic-layouts";
import { useMeta } from "@jpmorganchase/mosaic-store";
import { LayoutFullWidth } from "../LayoutFullWidth";
import type { LayoutProps } from "../types/index";
import layoutStyles from "../index.module.css";

export const DetailContentOnly: React.FC<LayoutProps> = ({
  FooterProps,
  children,
}) => {
  const {
    meta: { title },
  } = useMeta();

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

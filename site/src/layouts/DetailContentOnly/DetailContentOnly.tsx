import { LayoutBase } from "@jpmorganchase/mosaic-layouts";
import { Breadcrumbs } from "@jpmorganchase/mosaic-site-components";
import { useMeta } from "@jpmorganchase/mosaic-store";
import { SaltProvider } from "@salt-ds/core";
import clsx from "clsx";
import type React from "react";
import { AppHeader, Footer } from "../../components";
import { LayoutFullWidth } from "../LayoutFullWidth";
import layoutStyles from "../index.module.css";
import type { LayoutProps } from "../types/index";
import styles from "./DetailContentOnly.module.css";

export const DetailContentOnly: React.FC<LayoutProps> = ({
  FooterProps,
  children,
}) => {
  const {
    meta: { title },
  } = useMeta();

  return (
    <LayoutBase
      Header={<AppHeader />}
      className={clsx(layoutStyles.base, styles.base)}
    >
      <div className={layoutStyles.docsWrapper}>
        <LayoutFullWidth
          Footer={<Footer {...FooterProps} />}
          className={styles.layoutFullWidth}
        >
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

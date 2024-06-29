import { Sidebar } from "@jpmorganchase/mosaic-site-components";
import React, { type FC } from "react";
import { TableOfContents } from "../../components/toc";
import { DetailBase } from "../DetailBase";
import type { LayoutProps } from "../types/index";
import { Components } from "./Components";
import styles from "./DetailPattern.module.css";
import { RelatedPatterns } from "./RelatedPatterns";
import { Resources } from "./Resources";

export const DetailPattern: FC<LayoutProps> = ({ children }) => {
  return (
    <DetailBase
      sidebar={
        <Sidebar sticky>
          <div className={styles.toc}>
            <TableOfContents />
          </div>
          <Components />
          <RelatedPatterns />
          <Resources />
        </Sidebar>
      }
    >
      {children}
    </DetailBase>
  );
};

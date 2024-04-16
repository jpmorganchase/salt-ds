import React, { FC } from "react";
import {
  TableOfContents,
  Sidebar,
} from "@jpmorganchase/mosaic-site-components";
import { DetailBase } from "../DetailBase";
import { LayoutProps } from "../types/index";
import { Resources } from "./Resources";
import { Components } from "./Components";
import styles from "./DetailPattern.module.css";
import { RelatedPatterns } from "./RelatedPatterns";

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

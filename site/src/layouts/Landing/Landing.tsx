import React, { type FC } from "react";
import { AppHeader, Footer } from "../../components";

import { LayoutBase } from "@jpmorganchase/mosaic-layouts";
import { LayoutFullWidth } from "../LayoutFullWidth";
import layoutStyles from "../index.module.css";
import type { LayoutProps } from "../types/index";

export const Landing: FC<LayoutProps> = ({ FooterProps, children }) => (
  <LayoutBase Header={<AppHeader />} className={layoutStyles.base}>
    <LayoutFullWidth Footer={<Footer {...FooterProps} />}>
      {children}
    </LayoutFullWidth>
  </LayoutBase>
);

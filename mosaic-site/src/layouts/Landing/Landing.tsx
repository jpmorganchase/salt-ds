import React, { FC } from "react";
import { Footer, AppHeader } from "../../components";

import { LayoutBase } from "@jpmorganchase/mosaic-layouts";
import { LayoutFullWidth } from "../LayoutFullWidth";
import { LayoutProps } from "../types/index";

export const Landing: FC<LayoutProps> = ({ FooterProps, children }) => (
  <LayoutBase Header={<AppHeader />}>
    <LayoutFullWidth Footer={<Footer {...FooterProps} />}>
      {children}
    </LayoutFullWidth>
  </LayoutBase>
);

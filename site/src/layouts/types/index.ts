import type { LayoutProps as MosaicLayoutProps } from "@jpmorganchase/mosaic-layouts/dist/types";
import type { ReactElement } from "react";

export interface LayoutProps extends MosaicLayoutProps {
  sidebar?: ReactElement;
  pageTitle?: ReactElement;
  Footer?: ReactElement;
  isMobileView?: boolean;
}

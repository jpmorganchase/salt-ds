import { forwardRef, ForwardedRef, HTMLAttributes } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";

import "./TabPanel.css";

const withBaseName = makePrefixer("uitkTabPanel");

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  enableClose?: boolean;
  label: string;
}

export const TabPanel = forwardRef(function TabPanel(
  { children, className, enableClose, ...htmlAttributes }: TabPanelProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      {...htmlAttributes}
      className={cx(withBaseName(), className)}
      ref={forwardedRef}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
});

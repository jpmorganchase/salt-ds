import { forwardRef, ForwardedRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import "./TabPanel.css";

const withBaseName = makePrefixer("saltTabPanel");

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
      className={clsx(withBaseName(), className)}
      ref={forwardedRef}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
});

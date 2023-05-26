import { forwardRef, ForwardedRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import "./TabPanelNext.css";

const withBaseName = makePrefixer("saltTabPanelNext");

export interface TabPanelNextProps extends HTMLAttributes<HTMLDivElement> {
  enableClose?: boolean;
  label: string;
}

export const TabPanelNext = forwardRef(function TabPanel(
  { children, className, enableClose, ...htmlAttributes }: TabPanelNextProps,
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

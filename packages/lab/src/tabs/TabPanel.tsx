import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes } from "react";

import tabPanelCss from "./TabPanel.css";

const withBaseName = makePrefixer("saltTabPanel");

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  enableClose?: boolean;
  label: string;
}

export const TabPanel = forwardRef(function TabPanel(
  { children, className, enableClose, ...htmlAttributes }: TabPanelProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab-panel",
    css: tabPanelCss,
    window: targetWindow,
  });

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

import { ForwardedRef, forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import tabPanelCss from "./TabPanel.css";

const withBaseName = makePrefixer("saltTabPanel");

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  enableClose?: boolean;
  label: string;
}

export const TabPanel = forwardRef(function TabPanel(
  { children, className, enableClose, ...htmlAttributes }: TabPanelProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
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

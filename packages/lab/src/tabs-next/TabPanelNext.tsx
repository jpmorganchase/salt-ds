import { forwardRef, ForwardedRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tabPanelCss from "./TabPanelNext.css";

const withBaseName = makePrefixer("saltTabPanelNext");

export interface TabPanelNextProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
}

export const TabPanelNext = forwardRef(function TabPanel(
  { children, className, ...htmlAttributes }: TabPanelNextProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tabpanel-next",
    css: tabPanelCss,
    window: targetWindow,
  });

  return (
    <div
      tabIndex={0}
      {...htmlAttributes}
      className={clsx(withBaseName(), className)}
      ref={forwardedRef}
      role="tabpanel"
    >
      {children}
    </div>
  );
});

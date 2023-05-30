import { forwardRef, ForwardedRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tabPanelCss from "./TabPanelNext.css";

const withBaseName = makePrefixer("saltTabPanelNext");

export interface TabPanelNextProps extends HTMLAttributes<HTMLDivElement> {
  enableClose?: boolean;
  label: string;
}

export const TabPanelNext = forwardRef(function TabPanel(
  { children, className, enableClose, ...htmlAttributes }: TabPanelNextProps,
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

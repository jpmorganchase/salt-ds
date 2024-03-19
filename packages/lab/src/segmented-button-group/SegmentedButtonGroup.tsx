import { forwardRef, ComponentPropsWithRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import segmentedButtonGroupCss from "./SegmentedButtonGroup.css";

export interface SegmentedButtonGroupProps
  extends ComponentPropsWithRef<"div"> {}

const withBaseName = makePrefixer("saltSegmentedButtonGroup");

export const SegmentedButtonGroup = forwardRef<
  HTMLDivElement,
  SegmentedButtonGroupProps
>(function SegmentedButton({ className, children, ref, ...rest }) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-segmented-button-group",
    css: segmentedButtonGroupCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
    </div>
  );
});

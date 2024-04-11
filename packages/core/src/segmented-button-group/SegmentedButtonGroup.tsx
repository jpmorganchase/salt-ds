import { forwardRef, ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import segmentedButtonGroupCss from "./SegmentedButtonGroup.css";

export interface SegmentedButtonGroupProps
  extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltSegmentedButtonGroup");

export const SegmentedButtonGroup = forwardRef<
  HTMLDivElement,
  SegmentedButtonGroupProps
>(function SegmentedButtonGroup({ className, children, ...rest }, ref) {
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

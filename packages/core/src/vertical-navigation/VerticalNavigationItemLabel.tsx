import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import verticalNavigationItemLabelCss from "./VerticalNavigationItemLabel.css";

export interface VerticalNavigationItemLabelProps
  extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltVerticalNavigationItemLabel");

export const VerticalNavigationItemLabel = forwardRef<
  HTMLSpanElement,
  VerticalNavigationItemLabelProps
>(function VerticalNavigationItemLabel(props, ref) {
  const { children, className, ...rest } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-item-label",
    css: verticalNavigationItemLabelCss,
    window: targetWindow,
  });

  return (
    <span className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
    </span>
  );
});

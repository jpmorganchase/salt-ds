import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import verticalNavigationCss from "./VerticalNavigation.css";

export interface VerticalNavigationProps
  extends ComponentPropsWithoutRef<"ul"> {}

const withBaseName = makePrefixer("saltVerticalNavigation");

export const VerticalNavigation = forwardRef<
  HTMLUListElement,
  VerticalNavigationProps
>(function VerticalNavigation(props, ref) {
  const { className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation",
    css: verticalNavigationCss,
    window: targetWindow,
  });

  return <ul ref={ref} className={clsx(withBaseName(), className)} {...rest} />;
});

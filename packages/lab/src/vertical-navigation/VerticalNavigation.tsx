import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { SubMenuProvider } from "./SubMenuContext";
import verticalNavigationCss from "./VerticalNavigation.css";

export interface VerticalNavigationProps
  extends ComponentPropsWithoutRef<"ul"> {
  appearance?: "indicator" | "bordered";
}

const withBaseName = makePrefixer("saltVerticalNavigation");

export const VerticalNavigation = forwardRef<
  HTMLUListElement,
  VerticalNavigationProps
>(function VerticalNavigation(props, ref) {
  const { appearance = "indicator", className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation",
    css: verticalNavigationCss,
    window: targetWindow,
  });

  return (
    <SubMenuProvider>
      <ul
        ref={ref}
        className={clsx(withBaseName(), withBaseName(appearance), className)}
        {...rest}
      />
    </SubMenuProvider>
  );
});

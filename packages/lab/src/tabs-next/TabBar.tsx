import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import tabBarCss from "./TabBar.css";

export interface TabBarProps extends ComponentPropsWithRef<"div"> {
  /**
   * Styling variant with a bottom separator. Defaults to false
   */
  separator?: boolean;
  /**
   * Styling variant with left and right padding. Defaults to false
   */
  padding?: boolean;
}

const withBaseName = makePrefixer("saltTabBar");

export const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  function TabBar(props, ref) {
    const { className, children, separator, padding, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tab-bar",
      css: tabBarCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("separator")]: separator,
            [withBaseName("padding")]: padding,
          },
          className,
        )}
        {...rest}
        ref={ref}
      >
        {children}
      </div>
    );
  },
);

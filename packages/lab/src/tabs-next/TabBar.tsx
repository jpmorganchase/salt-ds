import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef } from "react";
import tabBarCss from "./TabBar.css";

export interface TabBarProps extends ComponentPropsWithRef<"div"> {
  /**
   * Styling variant with a bottom separator. Defaults to false
   */
  divider?: boolean;
  /**
   * Styling variant with left and right padding. Defaults to false
   */
  inset?: boolean;
}

const withBaseName = makePrefixer("saltTabBar");

export const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  function TabBar(props, ref) {
    const { className, children, divider, inset, ...rest } = props;

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
            [withBaseName("divider")]: divider,
            [withBaseName("inset")]: inset,
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

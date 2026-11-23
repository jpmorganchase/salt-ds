import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import tabBarCss from "./TabBar.css";

export interface TabBarProps extends ComponentPropsWithRef<"div"> {
  /**
   * If `true`, the tab bar has a bottom separator.
   */
  divider?: boolean;
  /**
   * If `true`, the tab bar has left and right padding.
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
        <div className={withBaseName("strip")}>{children}</div>
      </div>
    );
  },
);

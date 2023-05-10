import { clsx } from "clsx";
import { Toolbar } from "../toolbar";
import { makePrefixer } from "@salt-ds/core";
import { MenuIcon } from "@salt-ds/icons";

import appHeaderCss from "./AppHeader.css";
import { forwardRef, HTMLAttributes } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltAppHeader");

export type AppHeaderProps = HTMLAttributes<HTMLDivElement>;

export const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  ({ children, className, ...rest }, ref) => {
    const { window: targetWindow } = useWindow();
    useComponentCssInjection({
      id: "salt-app-header",
      css: appHeaderCss,
      window: targetWindow,
    });

    // const [innerContainerRef, overflowedItems] = useOverflowObserver(
    //   "horizontal",
    //   null
    // );

    return (
      <Toolbar
        className={clsx(withBaseName(), className)}
        ref={ref}
        overflowButtonIcon={<MenuIcon />}
        // OverflowButtonProps={{ align: "start" }}
      >
        {children}
      </Toolbar>
    );
    // return (
    //   <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
    //     <div className={withBaseName("innerContainer")} ref={innerContainerRef}>
    //       <OverflowMenu
    //         className={withBaseName("navMenu")}
    //         IconComponent={MenuIcon}
    //         source={overflowedItems}
    //       />
    //       {children}
    //     </div>
    //   </div>
    // );
  }
);

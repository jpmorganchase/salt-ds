import { makePrefixer } from "@salt-ds/core";
import { MenuIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import { Toolbar } from "../toolbar";

import appHeaderCss from "./AppHeader.css";

const withBaseName = makePrefixer("saltAppHeader");

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header) instead.
 */
export type AppHeaderProps = HTMLAttributes<HTMLDivElement>;

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header) instead.
 */
export const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  function AppHeader(
    {
      children,
      className,
      // ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-app-header",
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
  },
);

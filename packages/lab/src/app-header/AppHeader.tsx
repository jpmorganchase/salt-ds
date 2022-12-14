import cx from "classnames";
import { Toolbar } from "../toolbar";
import { makePrefixer } from "@salt-ds/core";
import { MenuIcon } from "@salt-ds/icons";

import "./AppHeader.css";
import { forwardRef, HTMLAttributes } from "react";

const withBaseName = makePrefixer("saltAppHeader");

export type AppHeaderProps = HTMLAttributes<HTMLDivElement>;

export const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  ({ children, className, ...rest }, ref) => {
    // const [innerContainerRef, overflowedItems] = useOverflowObserver(
    //   "horizontal",
    //   null
    // );

    return (
      <Toolbar
        className={cx(withBaseName(), className)}
        ref={ref}
        overflowButtonIcon={<MenuIcon />}
        // OverflowButtonProps={{ align: "start" }}
      >
        {children}
      </Toolbar>
    );
    // return (
    //   <div className={cx(withBaseName(), className)} ref={ref} {...rest}>
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

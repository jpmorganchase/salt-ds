import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import drawerActionsCss from "./DrawerActions.css";

const withBaseName = makePrefixer("saltDrawerActions");

export type DrawerActionsProps = ComponentPropsWithoutRef<"div">;

export const DrawerActions = forwardRef<HTMLDivElement, DrawerActionsProps>(
  function DrawerActions(props, ref) {
    const { children, className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-drawer-actions",
      css: drawerActionsCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);

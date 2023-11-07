import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useFloatingComponent, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { useMenuContext } from "./MenuContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import menuPanelCss from "./MenuPanel.css";

export interface MenuPanelProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltMenuPanel");

export const MenuPanel = forwardRef<HTMLDivElement, MenuPanelProps>(
  function MenuPanel(props, ref) {
    const { children, className, style, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-panel",
      css: menuPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();

    const { openState, refs, floatingStyles } = useMenuContext();

    const handleRef = useForkRef(refs.setFloating, ref);

    return (
      <FloatingComponent
        open={openState}
        ref={handleRef}
        style={{ ...floatingStyles, ...style }}
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        {children}
      </FloatingComponent>
    );
  }
);

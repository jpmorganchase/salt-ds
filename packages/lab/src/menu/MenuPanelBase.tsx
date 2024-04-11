import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import menuPanelCss from "./MenuPanel.css";

export interface MenuPanelBaseProps extends ComponentPropsWithoutRef<"div"> {}

export const MenuPanelBase = forwardRef<HTMLDivElement, MenuPanelBaseProps>(
  function MenuPanelBase(props, ref) {
    const { children, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-panel",
      css: menuPanelCss,
      window: targetWindow,
    });

    return (
      <div ref={ref} {...rest}>
        {children}
      </div>
    );
  }
);

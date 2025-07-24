import { FloatingList } from "@floating-ui/react";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer, useFloatingComponent, useForkRef } from "../utils";
import { useMenuContext } from "./MenuContext";
import { MenuPanelBase } from "./MenuPanelBase";
import { MenuPanelContext } from "./MenuPanelContext";

export interface MenuPanelProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the menu panel.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltMenuPanel");

export const MenuPanel = forwardRef<HTMLDivElement, MenuPanelProps>(
  function MenuPanel(props, ref) {
    const { children, className, ...rest } = props;
    const { Component: FloatingComponent } = useFloatingComponent();

    const {
      getItemProps,
      openState,
      getFloatingProps,
      refs,
      getPanelPosition,
      context,
      elementsRef,
      activeIndex,
      setFocusInside,
      isNested,
    } = useMenuContext();

    const handleRef = useForkRef<HTMLDivElement>(ref, refs?.setFloating);

    return (
      <MenuPanelContext.Provider
        value={{ activeIndex, getItemProps, setFocusInside }}
      >
        <FloatingList elementsRef={elementsRef}>
          <FloatingComponent
            open={openState}
            role="menu"
            {...getFloatingProps()}
            {...getPanelPosition()}
            className={clsx(withBaseName(), className)}
            focusManagerProps={
              context
                ? {
                    context,
                    initialFocus: isNested ? -1 : 0,
                    returnFocus: !isNested,
                    modal: false,
                  }
                : undefined
            }
            tabIndex={-1}
            ref={handleRef}
            {...rest}
          >
            <MenuPanelBase>{children}</MenuPanelBase>
          </FloatingComponent>
        </FloatingList>
      </MenuPanelContext.Provider>
    );
  },
);

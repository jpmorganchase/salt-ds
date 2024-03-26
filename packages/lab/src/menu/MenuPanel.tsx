import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useFloatingComponent, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { useMenuContext } from "./MenuContext";
import { MenuPanelBase } from "./MenuPanelBase";
import { FloatingList, useFloatingParentNodeId } from "@floating-ui/react";
import { MenuPanelContext } from "./MenuPanelContext";

export interface MenuPanelProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltMenuPanel");

export const MenuPanel = forwardRef<HTMLDivElement, MenuPanelProps>(
  function MenuPanel(props, ref) {
    const { children, className, ...rest } = props;
    const { Component: FloatingComponent } = useFloatingComponent();

    const parentId = useFloatingParentNodeId();
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
                    initialFocus: parentId ? -1 : 0,
                    returnFocus: !parentId,
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
  }
);

import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useContext,
} from "react";
import megaMenuContainerCss from "./MegaMenuContainer.css";
import { MegaMenuContext } from "./MegaMenuContext";

const withBaseName = makePrefixer("saltMegaMenuContainer");

export interface MegaMenuContainerProps extends HTMLAttributes<HTMLElement> {
  /**
   * The content of the mega menu container, typically MegaMenuHeader, MegaMenuGroup, and MegaMenuItem components.
   */
  children?: ReactNode;
}

export const MegaMenuContainer = forwardRef<
  HTMLElement,
  MegaMenuContainerProps
>(function MegaMenuContainer({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-container",
    css: megaMenuContainerCss,
    window: targetWindow,
  });

  const { Component: FloatingComponent } = useFloatingComponent();
  const megaMenu = useContext(MegaMenuContext);

  if (!megaMenu) {
    throw new Error("MegaMenuContainer must be used within a MegaMenu");
  }

  const floatingUIResult = useFloatingUI({
    rootContext: megaMenu.floatingRootContext,
    placement: megaMenu.placement,
  });

  const handleRef = useForkRef<HTMLElement>(ref, megaMenu.setFloating);

  const isOpen = megaMenu.openState;
  const floatingProps = megaMenu.getFloatingProps;

  return (
    <FloatingComponent
      open={isOpen}
      focusManagerProps={{
        context: floatingUIResult.context,
        modal: false,
        initialFocus: -1,
        returnFocus: true,
        closeOnFocusOut: false,
      }}
    >
      <nav
        className={clsx(withBaseName(), className)}
        ref={handleRef}
        role="region"
        {...floatingProps({
          ...rest,
          style: {
            ...rest.style,
            position: floatingUIResult.strategy,
            top: floatingUIResult.y ?? 0,
            left: floatingUIResult.x ?? 0,
          },
        })}
      >
        {children}
      </nav>
    </FloatingComponent>
  );
});

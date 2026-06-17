import { flip, limitShift, offset, shift } from "@floating-ui/react";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useEffect,
} from "react";
import megaMenuPanelCss from "./MegaMenuPanel.css";
import { useMegaMenu } from "./useMegaMenu";
import { focusFirstItem } from "./useMegaMenuNavigation";
import { usePageMargin } from "./usePageMargin";

const withBaseName = makePrefixer("saltMegaMenuPanel");

export interface MegaMenuPanelProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of the mega menu panel.
   */
  children?: ReactNode;
}

export const MegaMenuPanel = forwardRef<HTMLDivElement, MegaMenuPanelProps>(
  function MegaMenuPanel({ children, className, id: idProp, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-panel",
      css: megaMenuPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();
    const {
      openState: isOpen,
      floatingRootContext,
      placement,
      getFloatingProps,
      setFloating,
      focusFirstItemOnOpenRef,
      panelId,
      setPanelId,
    } = useMegaMenu();

    // The default id is generated in MegaMenu. Only propagate a
    // consumer-supplied id so the trigger stays in sync.
    useIsomorphicLayoutEffect(() => {
      if (idProp) setPanelId(idProp);
    }, [idProp, setPanelId]);

    const { domReference } = floatingRootContext.elements;
    const referenceEl =
      domReference instanceof HTMLElement ? domReference : null;
    const pageMargin = usePageMargin(referenceEl);

    const floatingUIResult = useFloatingUI({
      rootContext: floatingRootContext,
      open: isOpen,
      placement,
      middleware: [
        offset(1),
        flip({ padding: pageMargin }),
        shift({ padding: pageMargin, limiter: limitShift() }),
      ],
    });

    // Focus the first item on ArrowDown open, after floating-ui has positioned the panel
    const floatingEl = floatingRootContext.elements.floating;
    const { isPositioned } = floatingUIResult;
    useEffect(() => {
      if (focusFirstItemOnOpenRef.current && isPositioned && floatingEl) {
        focusFirstItem(floatingEl);
        focusFirstItemOnOpenRef.current = false;
      }
    }, [focusFirstItemOnOpenRef, isPositioned, floatingEl]);

    const floatingProps = getFloatingProps(rest);
    const handleRef = useForkRef<HTMLDivElement>(setFloating, ref);

    return (
      <FloatingComponent
        open={isOpen}
        position={floatingUIResult.strategy}
        top={floatingUIResult.y ?? 0}
        left={floatingUIResult.x ?? 0}
        focusManagerProps={{
          context: floatingUIResult.context,
          modal: false,
          initialFocus: -1,
          returnFocus: true,
          closeOnFocusOut: false,
          guards: false,
        }}
        className={clsx(withBaseName(), className)}
        id={panelId}
        role="region"
        {...floatingProps}
        ref={handleRef}
      >
        {children}
      </FloatingComponent>
    );
  },
);

import { flip, limitShift, offset, shift } from "@floating-ui/react";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
} from "react";
import megaMenuPanelCss from "./MegaMenuPanel.css";
import { useMegaMenu } from "./useMegaMenu";
import { focusFirstItem } from "./useMegaMenuNavigation";
import { usePageMargin } from "./usePageMargin";

const withBaseName = makePrefixer("saltMegaMenuPanel");

export interface MegaMenuPanelProps extends HTMLAttributes<HTMLDivElement> {
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
      focusFirstItemOnOpen,
      setPanelId,
    } = useMegaMenu();

    const id = useId(idProp);

    // Expose panel id for trigger.
    useEffect(() => {
      setPanelId(id);
      return () => setPanelId(undefined);
    }, [id, setPanelId]);

    const referenceEl = floatingRootContext.elements.domReference as
      | HTMLElement
      | null
      | undefined;
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
    const floatingEl = floatingRootContext.elements
      .floating as HTMLElement | null;
    const { isPositioned } = floatingUIResult;
    useEffect(() => {
      if (focusFirstItemOnOpen && isPositioned && floatingEl) {
        focusFirstItem(floatingEl);
      }
    }, [focusFirstItemOnOpen, isPositioned, floatingEl]);

    const floatingProps = getFloatingProps(rest);

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
        ref={setFloating}
      >
        <div
          className={clsx(withBaseName(), className)}
          id={id}
          role="region"
          ref={ref}
          {...floatingProps}
        >
          {children}
        </div>
      </FloatingComponent>
    );
  },
);

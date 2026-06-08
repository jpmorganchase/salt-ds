import { flip, limitShift, offset, shift, size } from "@floating-ui/react";
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
  useState,
} from "react";
import megaMenuPanelCss from "./MegaMenuPanel.css";
import { useMegaMenu } from "./useMegaMenu";
import { focusFirstItem } from "./useMegaMenuNavigation";

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

    // Register the panel id in context so the trigger can reference it via aria-controls.
    useEffect(() => {
      setPanelId(id);
      return () => setPanelId(undefined);
    }, [id, setPanelId]);

    // Focus the first item on ArrowDown open. floating-ui's `initialFocus` is
    // unreliable on React <18, so retry across frames instead.
    const floatingEl = floatingRootContext.elements.floating as
      | HTMLElement
      | null;
    useEffect(() => {
      if (focusFirstItemOnOpen && floatingEl) {
        focusFirstItem(floatingEl);
      }
    }, [focusFirstItemOnOpen, floatingEl]);

    // Resolve the panel's page-margin to a pixel value to override the margin as required.
    const [pageMargin, setPageMargin] = useState(0);
    useEffect(() => {
      if (!targetWindow) return;
      const referenceEl = floatingRootContext.elements.domReference as
        | HTMLElement
        | null
        | undefined;
      const host = referenceEl ?? targetWindow.document.body;
      const doc = targetWindow.document;
      const measure = () => {
        const probe = doc.createElement("div");
        probe.style.cssText =
          "position:absolute;visibility:hidden;pointer-events:none;width:var(--saltMegaMenuPanel-pageMargin, var(--salt-layout-page-margin));";
        host.appendChild(probe);
        const width = probe.getBoundingClientRect().width;
        probe.remove();
        setPageMargin((prev) => (prev === width ? prev : width));
      };
      measure();
      targetWindow.addEventListener("resize", measure);
      return () => targetWindow.removeEventListener("resize", measure);
    }, [targetWindow, floatingRootContext]);

    const floatingUIResult = useFloatingUI({
      rootContext: floatingRootContext,
      placement,
      middleware: [
        offset(1),
        flip({ padding: pageMargin }),
        shift({ padding: pageMargin, limiter: limitShift() }),
        size({
          padding: pageMargin,
          apply({ availableWidth, elements }) {
            elements.floating.style.setProperty(
              "--saltMegaMenuPanel-availableWidth",
              `${availableWidth}px`,
            );
          },
        }),
      ],
    });

    const floatingProps = getFloatingProps();

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
          {...rest}
        >
          {children}
        </div>
      </FloatingComponent>
    );
  },
);

import { flip, limitShift, offset, shift, size } from "@floating-ui/react";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import megaMenuPanelCss from "./MegaMenuPanel.css";
import { useMegaMenu } from "./useMegaMenu";
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
      panelId,
      focusFirstOnOpenRef,
    } = useMegaMenu();

    // The panel id is generated once in the provider so the trigger can
    // reference it via aria-controls; an explicit `id` prop still wins.
    const id = idProp ?? panelId;

    // Resolve the panel's page-margin to a pixel value (calc-based custom
    // property — see usePageMargin for why a laid-out probe is required) to
    // pad the flip / shift / size middleware.
    const referenceEl = floatingRootContext.elements
      .domReference as HTMLElement | null;
    const pageMargin = usePageMargin(referenceEl);

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
          // ArrowDown on a closed trigger requests one-press "open + focus the
          // first item" (index 0, resolved by FFM from DOM tabbable order).
          // Every other open path (click, Enter, Space) leaves focus on the
          // trigger (-1); Tab then moves focus in via FloatingFocusManager.
          initialFocus: focusFirstOnOpenRef.current ? 0 : -1,
          returnFocus: true,
          closeOnFocusOut: true,
          guards: true,
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

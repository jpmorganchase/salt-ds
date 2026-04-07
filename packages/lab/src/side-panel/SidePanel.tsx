import { FloatingFocusManager } from "@floating-ui/react";
import { makePrefixer, useFloatingUI, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  forwardRef,
  type MutableRefObject,
  useEffect,
  useState,
} from "react";
import sidePanelCss from "./SidePanel.css";
import { useSidePanelContext } from "./SidePanelContext";

const withBaseName = makePrefixer("saltSidePanel");

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Edge the panel is anchored to; controls animation direction and divider side.
   * @default "right"
   */
  position?: "right" | "left";
  /**
   * Which element receives focus when the panel opens.
   * Pass a number for the tabbable element index (0 = first), or a ref to a specific element.
   * @default 0
   */
  initialFocus?: number | MutableRefObject<HTMLElement | null>;
  /**
   * Change background color palette.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary";
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      position = "right",
      initialFocus = 0,
      variant = "primary",
      children,
      className,
      id: idProp,
      ...rest
    } = props;

    const [showComponent, setShowComponent] = useState(false);
    const targetWindow = useWindow();

    const {
      openState,
      floatingRootContext,
      setFloating,
      getFloatingProps,
      panelId,
    } = useSidePanelContext();

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    const id = useId(idProp || panelId);

    const { context } = useFloatingUI({
      rootContext: floatingRootContext,
    });

    const handleRef = useForkRef<HTMLDivElement>(setFloating, ref);

    useEffect(() => {
      if (openState) {
        setShowComponent(true);
        return;
      }
      const animate = setTimeout(() => {
        setShowComponent(false);
      }, 300); // var(--salt-duration-perceptible)
      return () => clearTimeout(animate);
    }, [openState]);

    if (!showComponent) return null;

    const panelDiv = (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(position)]: position,
            [withBaseName(variant)]: variant,
            [withBaseName("enterAnimation")]: openState,
            [withBaseName("exitAnimation")]: !openState,
          },
          className,
        )}
        id={id}
        {...getFloatingProps(rest)}
      >
        <div className={withBaseName("inner")}>{children}</div>
      </div>
    );

    if (openState) {
      return (
        <FloatingFocusManager
          context={context}
          modal={false}
          initialFocus={initialFocus}
          closeOnFocusOut={false}
          guards={false}
        >
          {panelDiv}
        </FloatingFocusManager>
      );
    }

    return panelDiv;
  },
);

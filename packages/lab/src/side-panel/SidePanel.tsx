import {
  FloatingFocusManager,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import { makePrefixer, useFloatingUI, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type CSSProperties,
  forwardRef,
  type MutableRefObject,
  useEffect,
  useState,
} from "react";
import sidePanelCss from "./SidePanel.css";

const withBaseName = makePrefixer("saltSidePanel");

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Edge the panel is anchored to; controls animation direction and divider side.
   * @default "left"
   */
  side?: "left" | "right" | "top" | "bottom";
  /**
   * Which element to focus when the panel opens. Index (0 = first tabbable) or a ref.
   * @default 0
   */
  initialFocus?: number | MutableRefObject<HTMLElement | null>;
  /**
   * Whether the panel is open.
   */
  open?: boolean;
  /**
   * Callback when open state should change (e.g. Escape key pressed).
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Change background color palette
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Height of the panel. Can be a number (pixels) or a CSS string value.
   */
  height?: number | string;
  /**
   * Width of the panel. Can be a number (pixels) or a CSS string value.
   */
  width?: number | string;
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      side = "left",
      initialFocus = 0,
      open = false,
      onOpenChange,
      variant = "primary",
      children,
      className,
      width,
      height,
      style,
      ...rest
    } = props;
    const [showComponent, setShowComponent] = useState(false);
    const targetWindow = useWindow();

    const { context, refs } = useFloatingUI({
      open,
      onOpenChange,
    });

    useInteractions([
      useDismiss(context, { escapeKey: true, outsidePress: false }),
    ]);

    const handleRef = useForkRef<HTMLDivElement>(refs.setFloating, ref);

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    useEffect(() => {
      if (open) {
        setShowComponent(true);
        return;
      }
      const animate = setTimeout(() => {
        setShowComponent(false);
      }, 300); // var(--salt-duration-perceptible)
      return () => clearTimeout(animate);
    }, [open]);

    if (!showComponent) return null;

    const customStyle = {
      ...style,
      ...(width && {
        "--saltSidePanel-width":
          typeof width === "number" ? `${width}px` : width,
      }),
      ...(height && {
        "--saltSidePanel-height":
          typeof height === "number" ? `${height}px` : height,
      }),
    } as CSSProperties;

    const panelDiv = (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(side)]: side,
            [withBaseName(variant)]: variant,
            [withBaseName("enterAnimation")]: open,
            [withBaseName("exitAnimation")]: !open,
          },
          className,
        )}
        style={customStyle}
        tabIndex={-1}
        role="region"
        {...rest}
      >
        <div className={clsx(withBaseName("inner"))}>{children}</div>
      </div>
    );

    if (open) {
      return (
        <FloatingFocusManager
          context={context}
          modal={false}
          initialFocus={initialFocus}
          returnFocus
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

import {
  FloatingFocusManager,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { makePrefixer, useForkRef } from "@salt-ds/core";
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

const withBaseName = makePrefixer("saltSidePanel");

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Whether the panel is open.
   */
  open?: boolean;
  /**
   * Edge the panel is anchored to; controls animation direction and divider side.
   * @default "left"
   */
  side?: "left" | "right" | "top" | "bottom";
  /**
   * Callback when open state should change (e.g. Escape key pressed).
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Which element to focus when the panel opens. Index (0 = first tabbable) or a ref.
   * @default 0
   */
  initialFocus?: number | MutableRefObject<HTMLElement | null>;
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      open = false,
      side = "left",
      onOpenChange,
      initialFocus = 0,
      children,
      className,
      ...rest
    } = props;
    const [showComponent, setShowComponent] = useState(open);
    const targetWindow = useWindow();

    const { context, refs } = useFloating({ open, onOpenChange });

    const { getFloatingProps } = useInteractions([
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

    const panelDiv = (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(side)]: side,
            [withBaseName("enterAnimation")]: open,
            [withBaseName("exitAnimation")]: !open,
          },
          className,
        )}
        tabIndex={-1}
        role="region"
        {...getFloatingProps()}
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

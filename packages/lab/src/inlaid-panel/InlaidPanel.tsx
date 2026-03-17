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
import inlaidPanelCss from "./InlaidPanel.css";

const withBaseName = makePrefixer("saltInlaidPanel");

export interface InlaidPanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Whether the panel is open.
   */
  open?: boolean;
  /**
   * Edge the panel is anchored to; controls animation direction and divider side. Defaults to `left`.
   */
  position?: "left" | "right" | "top" | "bottom";
  /**
   * Callback when open state should change (e.g. Escape key pressed).
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Which element to focus when the panel opens. Index (0 = first tabbable) or a ref. Defaults to 0.
   */
  initialFocus?: number | MutableRefObject<HTMLElement | null>;
}

export const InlaidPanel = forwardRef<HTMLDivElement, InlaidPanelProps>(
  function InlaidPanel(props, ref) {
    const {
      open = false,
      position = "left",
      onOpenChange,
      initialFocus,
      children,
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
      testId: "salt-inlaid-panel",
      css: inlaidPanelCss,
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
        className={clsx(withBaseName(), {
          [withBaseName(position)]: position,
          [withBaseName("enterAnimation")]: open,
          [withBaseName("exitAnimation")]: !open,
        })}
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
          initialFocus={initialFocus ?? 0}
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

import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  forwardRef,
  useEffect,
  useRef,
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
}

export const InlaidPanel = forwardRef<HTMLDivElement, InlaidPanelProps>(
  function InlaidPanel(props, ref) {
    const { open = false, position = "left", children, ...rest } = props;
    const [showComponent, setShowComponent] = useState(open);
    const targetWindow = useWindow();
    const panelRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(panelRef, ref);
    const returnFocusRef = useRef<Element | null>(null);

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

    useEffect(() => {
      if (showComponent && open) {
        returnFocusRef.current = document.activeElement;
        panelRef.current?.focus();
      } else if (showComponent && !open) {
        (returnFocusRef.current as HTMLElement | null)?.focus?.();
        returnFocusRef.current = null;
      }
    }, [showComponent, open]);

    if (!showComponent) return null;

    return (
      <div
        ref={handleRef}
        className={clsx(withBaseName(), {
          [withBaseName(position)]: position,
          [withBaseName("enterAnimation")]: open,
          [withBaseName("exitAnimation")]: !open,
        })}
        role="region"
        tabIndex={-1}
        {...rest}
      >
        <div className={clsx(withBaseName("inner"))}>{children}</div>
      </div>
    );
  }
);

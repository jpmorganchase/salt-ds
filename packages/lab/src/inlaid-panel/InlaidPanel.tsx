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
import { useInlaidPanel } from "./InlaidPanelContext";

const withBaseName = makePrefixer("saltInlaidPanel");

export interface InlaidPanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Edge the panel is anchored to; controls animation direction and divider side. Defaults to `left`.
   */
  position?: "left" | "right" | "top" | "bottom";
}

export const InlaidPanel = forwardRef<HTMLDivElement, InlaidPanelProps>(
  function InlaidPanel(props, ref) {
    const { position = "left", children, ...rest } = props;

    const { open, panelId, lastTriggerRef } = useInlaidPanel();

    const panelRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(panelRef, ref);

    const [showComponent, setShowComponent] = useState(open);

    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-inlaid-panel",
      css: inlaidPanelCss,
      window: targetWindow,
    });

    useEffect(() => {
      if (open && !showComponent) {
        setShowComponent(true);
      }

      if (!open && showComponent) {
        const trigger = lastTriggerRef.current;
        if (trigger?.isConnected) {
          trigger.focus({ preventScroll: true });
        }

        const timer = setTimeout(() => {
          setShowComponent(false);
        }, 300); // var(--salt-duration-perceptible)
        return () => clearTimeout(timer);
      }
    }, [open, showComponent, lastTriggerRef]);

    useEffect(() => {
      if (open && showComponent) {
        panelRef.current?.focus({ preventScroll: true });
      }
    }, [open, showComponent]);

    if (!showComponent) {
      return null;
    }

    return (
      <div
        id={panelId}
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
  },
);

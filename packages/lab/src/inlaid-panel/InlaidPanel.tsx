import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type ReactNode, useEffect, useRef } from "react";
import inlaidPanelCss from "./InlaidPanel.css";
import { useInlaidPanel } from "./InlaidPanelContext";

const withBaseName = makePrefixer("saltInlaidPanel");

export interface InlaidPanelProps {
  position?: "left" | "right" | "top" | "bottom";
  minSize?: number;
  maxSize?: number;
  label?: string;
  duration?: number;
  children?: ReactNode;
}

export function InlaidPanel({
  position = "left",
  minSize = 280,
  maxSize,
  label = "Side panel",
  duration = 300,
  children,
}: InlaidPanelProps) {
  const { open, panelId, triggerRef } = useInlaidPanel();
  const ref = useRef<HTMLDivElement>(null);
  const isColumn = position === "left" || position === "right";
  const easing = "cubic-bezier(0.4, 0, 0.2, 1)";
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-inlaid-panel",
    css: inlaidPanelCss,
    window: targetWindow,
  });

  // Open — remove inert then focus container
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    el.removeAttribute("inert");
    const raf = requestAnimationFrame(() => el.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Close — set inert and return focus to trigger synchronously
  useEffect(() => {
    if (open) return;
    ref.current?.setAttribute("inert", "");
    triggerRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div
      className={withBaseName("track")}
      data-position={position}
      data-state={open ? "open" : "closed"}
      style={{
        overflow: "hidden",
        flexShrink: 0,
        alignSelf: "stretch",
        ...(isColumn
          ? {
              width: open ? minSize : 0,
              maxWidth: maxSize,
              transition: `width ${duration}ms ${easing}`,
            }
          : {
              height: open ? minSize : 0,
              maxHeight: maxSize,
              transition: `height ${duration}ms ${easing}`,
            }),
      }}
    >
      <div
        id={panelId}
        ref={ref}
        className={withBaseName("inner")}
        role="region"
        aria-label={label}
        tabIndex={-1}
        style={{
          overflow: "auto",
          ...(isColumn
            ? { width: minSize, height: "100%" }
            : { height: minSize, width: "100%" }),
          ...(maxSize && isColumn ? { maxWidth: maxSize } : {}),
          ...(maxSize && !isColumn ? { maxHeight: maxSize } : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}

import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ReactNode, useEffect, useRef, useState } from "react";
import inlaidPanelCss from "./InlaidPanel.css";
import { useInlaidPanel } from "./InlaidPanelContext";

const withBaseName = makePrefixer("saltInlaidPanel");

export interface InlaidPanelProps {
  position?: "left" | "right" | "top" | "bottom";
  label?: string;
  children?: ReactNode;
}

export function InlaidPanel({
  position = "left",
  label = "Side panel",
  children,
}: InlaidPanelProps) {
  const { open, panelId, triggerRef } = useInlaidPanel();
  const innerRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-inlaid-panel",
    css: inlaidPanelCss,
    window: targetWindow,
  });

  useEffect(() => {
    if (open) {
      innerRef.current?.focus({ preventScroll: true });
    } else {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  return (
    <div
      className={clsx(withBaseName("track"), {
        [withBaseName("focused")]: focused,
      })}
      data-position={position}
      data-state={open ? "open" : "closed"}
    >
      <div
        id={panelId}
        ref={innerRef}
        className={clsx(withBaseName("inner"))}
        role="region"
        aria-label={label}
        tabIndex={-1}
        onFocus={(e) => {
          if (e.target === e.currentTarget) setFocused(true);
        }}
        onBlur={() => setFocused(false)}
      >
        {children}
      </div>
    </div>
  );
}

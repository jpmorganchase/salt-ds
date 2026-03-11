import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ReactNode, useEffect, useRef, useState } from "react";
import inlaidPanelCss from "./InlaidPanel.css";
import { useInlaidPanel } from "./InlaidPanelContext";

const withBaseName = makePrefixer("saltInlaidPanel");
const animationDurationMs = 300;

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
  const { open, panelId, lastTriggerRef } = useInlaidPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousOpenRef = useRef(open);
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(!open);
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-inlaid-panel",
    css: inlaidPanelCss,
    window: targetWindow,
  });

  useEffect(() => {
    if (previousOpenRef.current && !open) {
      const trigger = lastTriggerRef.current;
      if (trigger?.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    }

    previousOpenRef.current = open;
  }, [open, lastTriggerRef]);

  useEffect(() => {
    if (open && !isClosed) {
      panelRef.current?.focus({ preventScroll: true });
    }
  }, [open, isClosed]);

  useEffect(() => {
    if (open) {
      setIsClosing(false);
      setIsClosed(false);
      return;
    }

    if (!isClosed) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        setIsClosed(true);
      }, animationDurationMs);
      return () => clearTimeout(timer);
    }
  }, [open, isClosed]);

  return (
    <div
      id={panelId}
      ref={panelRef}
      className={clsx(withBaseName(), {
        [withBaseName(position)]: position,
        [withBaseName("open")]: open,
        [withBaseName("closing")]: isClosing,
        [withBaseName("closed")]: isClosed,
        [withBaseName("enterAnimation")]: open,
        [withBaseName("exitAnimation")]: isClosing,
      })}
      role="region"
      aria-label={label}
      tabIndex={-1}
    >
      <div className={clsx(withBaseName("inner"))}>{children}</div>
    </div>
  );
}

import type {
  ElementProps,
  FloatingContext,
} from "@floating-ui/react-dom-interactions";
import { PointerEvent, useEffect, useRef } from "react";
import { useAriaAnnouncer } from "../aria-announcer";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";

function getDocument(floating: HTMLElement | null) {
  return floating?.ownerDocument ?? document;
}

function getWindow(value: any) {
  return getDocument(value).defaultView ?? window;
}

function isElement(value: any): value is HTMLElement {
  return value ? value instanceof getWindow(value).Element : false;
}

function getDelay(
  value: Props["delay"],
  prop: "open" | "close",
  pointerType?: PointerEvent["pointerType"]
) {
  if (pointerType && pointerType !== "mouse") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return value?.[prop];
}

type Props = {
  delay?: number | Partial<{ open: number; close: number }>;
};

export const useAriaAnnounce = (
  context: FloatingContext,
  { delay = 0 }: Props
): ElementProps => {
  const { open, dataRef, refs } = context;

  const pointerTypeRef = useRef<PointerEvent["pointerType"]>();
  const timeoutRef = useRef<number>();
  const blockMouseMoveRef = useRef(true);
  const { announce } = useAriaAnnouncer();

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      pointerTypeRef.current = undefined;
    }
  });

  useEffect(() => {
    const reference = refs.reference.current;
    function announceFloating() {
      const tooltipContent = refs.floating.current?.innerText;

      if (tooltipContent) {
        announce(tooltipContent);
      }
    }

    function onMouseEnter(event: MouseEvent) {
      clearTimeout(timeoutRef.current);

      if (open) {
        return;
      }

      blockMouseMoveRef.current = false;
      dataRef.current.openEvent = event;

      if (delay) {
        timeoutRef.current = window.setTimeout(() => {
          announceFloating();
        }, getDelay(delay, "open", pointerTypeRef.current));
      } else {
        announceFloating();
      }
    }

    if (isElement(reference)) {
      reference.addEventListener("mouseenter", onMouseEnter);
      return () => {
        reference.removeEventListener("mouseenter", onMouseEnter);
      };
    }
  }, [dataRef, delay, open, refs.reference, refs.floating, announce]);

  function setPointerRef(event: PointerEvent) {
    pointerTypeRef.current = event.pointerType;
  }

  return {
    reference: {
      onPointerDown: setPointerRef,
      onPointerEnter: setPointerRef,
    },
    floating: {
      onMouseEnter() {
        clearTimeout(timeoutRef.current);
      },
    },
  };
};

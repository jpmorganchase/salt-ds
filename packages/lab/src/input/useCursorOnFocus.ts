import { ownerDocument } from "@jpmorganchase/uitk-core";
import { MouseEvent, MutableRefObject, useEffect, useRef } from "react";

function getSelectionRange(
  input: HTMLInputElement,
  { highlightOnFocus, cursorPositionOnFocus }: useCursorOnFocusProps
): [number | null, number | null] {
  // highlightOnFocus highlight first so it takes priority over position on focus
  if (highlightOnFocus === true) {
    return [0, input.value.length];
  }
  if (Array.isArray(highlightOnFocus) && highlightOnFocus.length > 1) {
    return [highlightOnFocus[0], highlightOnFocus[1]];
  }

  if (cursorPositionOnFocus === "start") {
    return [0, 0];
  }

  if (cursorPositionOnFocus === "end") {
    return [input.value.length, input.value.length];
  }

  if (cursorPositionOnFocus != null && !isNaN(cursorPositionOnFocus)) {
    return [cursorPositionOnFocus, cursorPositionOnFocus];
  }
  return [null, null];
}

function isSafari() {
  return (
    navigator.userAgent.toLowerCase().includes("safari") &&
    !navigator.userAgent.toLowerCase().includes("chrome")
  );
}

function isFirefox() {
  return navigator.userAgent.toLowerCase().includes("firefox");
}

export interface useCursorOnFocusProps {
  /**
   * Determines the position of the text cursor on focus of the input.
   *
   * start = place cursor at the beginning
   * end = place cursor at the end
   * \# = index to place the cursor
   */
  cursorPositionOnFocus?: "start" | "end" | number;
  /**
   * Determines what gets highlighted on focus of the input.
   *
   * If `true` all text will be highlighted.
   * If an array text between those indices will be highlighted
   * e.g. [0,1] will highlight the first character.
   */
  highlightOnFocus?: boolean | number[];
}

export function useCursorOnFocus(
  inputRef: MutableRefObject<HTMLInputElement | null>,
  { cursorPositionOnFocus, highlightOnFocus }: useCursorOnFocusProps
) {
  const wasClick = useRef(false);
  const timeoutRef = useRef<number>(-1);
  const originalCursorPosition = useRef<number | null | undefined>(-1);
  const selectionInProgress = useRef(false);
  const mouseMovement = useRef(0);

  const selection = useRef<[number | null, number | null]>([null, null]);
  const wasWindowFocus = useRef(false);

  const handleMouseDown = () => {
    wasClick.current = true;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (selectionInProgress.current) {
      mouseMovement.current +=
        Math.abs(event.movementX) + Math.abs(event.movementY);

      //Prevents the slightest mouse movement triggering the cursor to be repositioned.
      if (mouseMovement.current < 3) {
        event.preventDefault();

        return;
      }

      if (typeof originalCursorPosition.current == "number") {
        // Allows continued highlighted if the mouse down is part of a selection.
        inputRef.current?.setSelectionRange(
          originalCursorPosition.current,
          originalCursorPosition.current
        );
      }

      //Reset so originalCursorPosition is only set once.
      selectionInProgress.current = false;
    }
  };

  const handleMouseUp = () => {
    const isValidBrowser = isFirefox() || isSafari();
    if (
      selectionInProgress.current &&
      mouseMovement.current < 3 &&
      isValidBrowser &&
      Array.isArray(selection.current)
    ) {
      const [start, end] = selection.current;
      setTimeout(() => {
        if (
          (inputRef.current?.selectionStart !== start ||
            inputRef.current?.selectionEnd !== end) &&
          typeof start === "number" &&
          typeof end === "number"
        ) {
          inputRef.current?.setSelectionRange(start, end);
        }
      }, 0);
    }

    wasClick.current = false;
    selectionInProgress.current = false;
    mouseMovement.current = 0;
  };

  useEffect(() => {
    if (cursorPositionOnFocus != null || highlightOnFocus != null) {
      const handleFocusBehaviour = () => {
        if (!inputRef.current) {
          return;
        }

        const [start, end] = getSelectionRange(inputRef.current, {
          highlightOnFocus,
          cursorPositionOnFocus,
        });
        if (start !== null && end !== null) {
          window.clearTimeout(timeoutRef.current);
          const needsTimeout = isSafari() || wasClick.current;

          if (wasClick.current) {
            selectionInProgress.current = true;
            mouseMovement.current = 0;
          }

          selection.current = [start, end];
          // Keyboard focus needs to be outside setTimeout otherwise a flash of selected text appears.
          if (needsTimeout) {
            // Make's sure setSelectionRange is run after browser has set cursor position.
            timeoutRef.current = window.setTimeout(() => {
              if (wasClick.current) {
                originalCursorPosition.current =
                  inputRef.current?.selectionStart;
              }
              inputRef.current?.setSelectionRange(start, end);
            }, 0);
          } else {
            inputRef.current?.setSelectionRange(start, end);
          }
        }
      };

      const handleFocusIn = () => {
        // Ignore focus of input on window focus
        if (wasWindowFocus.current) {
          wasWindowFocus.current = false;
          return;
        }

        if (cursorPositionOnFocus != null || highlightOnFocus != null) {
          handleFocusBehaviour();
        }
      };

      //Reset everything on window re-focus
      const handleWindowFocus = () => {
        const doc = ownerDocument(inputRef.current);
        if (
          doc.visibilityState === "visible" &&
          doc.activeElement === inputRef.current
        ) {
          wasClick.current = false;
          selectionInProgress.current = false;
          mouseMovement.current = 0;
          wasWindowFocus.current = true;
        }
      };

      const eventName = isSafari() || isFirefox() ? "focusIn" : "focus";
      const input = inputRef.current;
      const doc = ownerDocument(inputRef.current);
      input?.addEventListener(eventName, handleFocusIn);
      doc.addEventListener("visibilitychange", handleWindowFocus);

      return () => {
        input?.removeEventListener(eventName, handleFocusIn);
        doc?.removeEventListener("visibilitychange", handleWindowFocus);
      };
    }

    return undefined;
  }, [cursorPositionOnFocus, highlightOnFocus, inputRef]);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
}

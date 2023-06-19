import { MutableRefObject, useEffect, useRef } from "react";

function getSelectionRange(
  input: HTMLInputElement,
  { highlightOnFocus, cursorPositionOnFocus }: useCursorOnFocusProps
): [number | null, number | null] {
  // Highlight first so it takes priority over position on focus
  if (Array.isArray(highlightOnFocus) && highlightOnFocus.length > 1) {
    return [highlightOnFocus[0], highlightOnFocus[1]];
  }
  if (highlightOnFocus === true) {
    return [0, input.value.length];
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
  cursorPositionOnFocus?: "start" | "end" | number;
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

  const selection = useRef<[number | null, number | null]>([null, null]);

  const eventName = isSafari() || isFirefox() ? "focusIn" : "focus";

  const handleMouseDown = () => {
    wasClick.current = true;
  };

  const handleMouseUp = () => {
    wasClick.current = false;
    selectionInProgress.current = false;
  };

  useEffect(() => {
    if (cursorPositionOnFocus != null || highlightOnFocus != null) {
      const handleFocusBehaviour = () => {
        if (!inputRef?.current) return;

        const [start, end] = getSelectionRange(inputRef.current, {
          highlightOnFocus,
          cursorPositionOnFocus,
        });
        
        if (start !== null && end !== null) {
          window.clearTimeout(timeoutRef.current);

          selection.current = [start, end];
          
          if (wasClick.current) {
            selectionInProgress.current = true;
            timeoutRef.current = window.setTimeout(() => {
              originalCursorPosition.current =
                inputRef.current?.selectionStart;
              inputRef.current?.setSelectionRange(start, end);
            }, 0);
          } else {
            inputRef.current?.setSelectionRange(start, end);
          }
        }
      };

      const handleFocusIn = () => {
        if (cursorPositionOnFocus != null || highlightOnFocus != null) {
          handleFocusBehaviour();
        }
      };

      const input = inputRef?.current;
      input?.addEventListener(eventName, handleFocusIn);

      return () => {
        input?.removeEventListener(eventName, handleFocusIn);
      };
    }

    return undefined;
  }, [cursorPositionOnFocus, highlightOnFocus, inputRef]);

  return { handleMouseDown, handleMouseUp };
}

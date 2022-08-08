import { RefObject, useEffect } from "react";

export type ClickawayHook = (props: {
  popperRef: RefObject<HTMLElement>;
  rootRef: RefObject<HTMLElement>;
  isOpen: boolean;
  onClose: () => void;
}) => void;

type MouseEventHandler = (e: MouseEvent) => void;
type KeyboardEventHandler = (e: KeyboardEvent) => void;

const NO_HANDLERS: [MouseEventHandler?, KeyboardEventHandler?] = [];

export const useClickAway: ClickawayHook = ({
  popperRef,
  rootRef,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const [clickHandler, escapeKeyHandler] = isOpen
      ? [
          (evt: MouseEvent) => {
            const targetElement = evt.target as HTMLElement;
            if (
              !popperRef.current?.contains(targetElement) &&
              !rootRef.current?.contains(targetElement)
            ) {
              onClose();
            }
          },
          (e: KeyboardEvent) => {
            if (e.key === "Escape") {
              onClose();
            }
          },
        ]
      : NO_HANDLERS;

    if (clickHandler && escapeKeyHandler) {
      document.body.addEventListener("mousedown", clickHandler, true);
      document.body.addEventListener("keydown", escapeKeyHandler, true);
    }

    return () => {
      if (clickHandler && escapeKeyHandler) {
        document.body.removeEventListener("mousedown", clickHandler, true);
        document.body.removeEventListener("keydown", escapeKeyHandler, true);
      }
    };
  }, [isOpen, onClose]);
};

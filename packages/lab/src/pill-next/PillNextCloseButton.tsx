import { forwardRef, KeyboardEvent, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer } from "@salt-ds/core";
import pillCloseButtonCss from "./PillNextCloseButton.css";
import { CloseSmallIcon } from "@salt-ds/icons";

export interface PillNextCloseButtonProps
  extends ComponentPropsWithoutRef<"button"> {
  /* If true the close button will be disabled */
  disabled?: boolean;
  onClose: () => void;
}

const withButtonBaseName = makePrefixer("saltPillNextCloseButton");

export const PillNextCloseButton = forwardRef<
  HTMLButtonElement,
  PillNextCloseButtonProps
>(function PillNextCloseButton({ disabled, onClose, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pill-next-close-button",
    css: pillCloseButtonCss,
    window: targetWindow,
  });
  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Backspace":
      case "Delete":
        e.stopPropagation();
        onClose();
        break;
      default:
        return;
    }
  };
  const handleClose = () => {
    if (!disabled) {
      onClose?.();
    }
  };

  return (
    <button
      data-testid="pill-close-button"
      ref={ref}
      className={clsx(withButtonBaseName(), {
        [withButtonBaseName("disabled")]: disabled,
      })}
      onClick={handleClose}
      onKeyUp={handleKeyUp}
      {...rest}
    >
      <CloseSmallIcon />
    </button>
  );
});

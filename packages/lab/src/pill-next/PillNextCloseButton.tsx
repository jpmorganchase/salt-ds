import {
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  ComponentPropsWithoutRef,
} from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Button, makePrefixer, useButton } from "@salt-ds/core";
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
  const { buttonProps } = useButton<HTMLButtonElement>({
    disabled,
    ...rest,
  });
  // we do not want to spread tab index in this case because the button element
  // does not require tabindex="0" attribute
  const { tabIndex, onKeyUp, onClick, ...restCloseButtonProps } = buttonProps;

  const handleKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!disabled) {
      switch (e.key) {
        case "Backspace":
        case "Delete":
          e.stopPropagation();
          handleClose();
          break;
        default:
          onKeyUp(e);
      }
    }
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      handleClose();
      onClick?.(e);
    }
  };

  const handleClose = () => onClose?.();

  return (
    <Button
      data-testid="pill-close-button"
      ref={ref}
      className={clsx(withButtonBaseName(), {
        [withButtonBaseName("disabled")]: disabled,
      })}
      onClick={handleClick}
      onKeyUp={handleKeyUp}
      {...restCloseButtonProps}
    >
      <CloseSmallIcon />
    </Button>
  );
});

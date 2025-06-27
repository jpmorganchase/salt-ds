import { Button, type ButtonProps, useIcon } from "@salt-ds/core";
import { type MouseEventHandler, forwardRef, useCallback } from "react";
import { usePrevNextButtons } from "./usePrevNextButtons";

/**
 * Props for the CarouselNextButton component.
 */
export interface CarouselNextButtonProps
  extends Omit<ButtonProps, "selectionVariant"> {}

export const CarouselNextButton = forwardRef<
  HTMLButtonElement,
  CarouselNextButtonProps
>(function CarouselNextButton({ className, onClick, ...rest }, ref) {
  const { NextIcon } = useIcon();
  const { nextBtnDisabled, onNextButtonClick } = usePrevNextButtons();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      onNextButtonClick();
      onClick?.(event);
    },
    [onNextButtonClick, onClick],
  );

  return (
    <Button
      onClick={handleClick}
      disabled={nextBtnDisabled}
      focusableWhenDisabled
      appearance="bordered"
      sentiment="neutral"
      aria-label="Next slide"
      ref={ref}
      {...rest}
    >
      <NextIcon aria-hidden />
    </Button>
  );
});

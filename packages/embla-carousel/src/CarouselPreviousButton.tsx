import { Button, type ButtonProps, useIcon } from "@salt-ds/core";
import { type MouseEventHandler, forwardRef, useCallback } from "react";
import { usePrevNextButtons } from "./usePrevNextButtons";

/**
 * Props for the CarouselPreviousButton component.
 */
export interface CarouselPreviousButtonProps
  extends Omit<ButtonProps, "variant"> {}

export const CarouselPreviousButton = forwardRef<
  HTMLButtonElement,
  CarouselPreviousButtonProps
>(function CarouselPreviousButton({ className, onClick, ...rest }, ref) {
  const { PreviousIcon } = useIcon();
  const { prevBtnDisabled, onPrevButtonClick } = usePrevNextButtons();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      onPrevButtonClick();
      onClick?.(event);
    },
    [onPrevButtonClick, onClick],
  );

  return (
    <Button
      onClick={handleClick}
      disabled={prevBtnDisabled}
      focusableWhenDisabled
      appearance="bordered"
      sentiment="neutral"
      aria-label="Previous slide"
      ref={ref}
      {...rest}
    >
      <PreviousIcon aria-hidden />
    </Button>
  );
});

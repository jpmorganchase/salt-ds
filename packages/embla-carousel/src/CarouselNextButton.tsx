import { Button, type ButtonProps, useIcon } from "@salt-ds/core";
import { forwardRef, type MouseEventHandler } from "react";
import { usePrevNextButtons } from "./usePrevNextButtons";

/**
 * Props for the CarouselNextButton component.
 */
export interface CarouselNextButtonProps
  extends Omit<ButtonProps, "variant" | "loading" | "loadingAnnouncement"> {}

export const CarouselNextButton = forwardRef<
  HTMLButtonElement,
  CarouselNextButtonProps
>(function CarouselNextButton({ className, onClick, ...rest }, ref) {
  const { NextIcon } = useIcon();
  const { nextBtnDisabled, onNextButtonClick } = usePrevNextButtons();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onNextButtonClick();
    onClick?.(event);
  };

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

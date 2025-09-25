import { Button, type ButtonProps, useIcon } from "@salt-ds/core";
import { forwardRef, type MouseEventHandler } from "react";
import { useCarouselContext } from "./CarouselContext";
import { usePrevNextButtons } from "./usePrevNextButtons";

/**
 * Props for the CarouselPreviousButton component.
 */
export interface CarouselPreviousButtonProps
  extends Omit<ButtonProps, "variant" | "loading" | "loadingAnnouncement"> {}

export const CarouselPreviousButton = forwardRef<
  HTMLButtonElement,
  CarouselPreviousButtonProps
>(function CarouselPreviousButton({ className, onClick, ...rest }, ref) {
  const { PreviousIcon } = useIcon();
  const { prevBtnDisabled, onPrevButtonClick } = usePrevNextButtons();

  const { carouselId } = useCarouselContext();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onPrevButtonClick();
    onClick?.(event);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={prevBtnDisabled}
      focusableWhenDisabled
      appearance="transparent"
      aria-controls={`${carouselId}-slides`}
      sentiment="neutral"
      aria-label="Previous slide"
      ref={ref}
      {...rest}
    >
      <PreviousIcon aria-hidden />
    </Button>
  );
});

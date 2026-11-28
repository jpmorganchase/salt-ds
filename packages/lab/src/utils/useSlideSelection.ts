import { useState } from "react";
import type { LayoutAnimationTransition } from "../deck-layout";

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useSlideSelection = (
  initialValue?: number,
): [
  LayoutAnimationTransition | undefined,
  number,
  (sliderIndex: number, transition?: LayoutAnimationTransition) => void,
] => {
  const [selectedSlide, setSelectedSlide] = useState(initialValue || 0);
  const [selectedTransition, setSelectedTransition] = useState<
    LayoutAnimationTransition | undefined
  >(undefined);

  const handleSlideSelection = (
    sliderIndex: number,
    transition?: LayoutAnimationTransition,
  ) => {
    const newTransition = transition
      ? transition
      : selectedSlide < sliderIndex
        ? "increase"
        : "decrease";
    setSelectedSlide(sliderIndex);
    setSelectedTransition(newTransition);
  };
  return [selectedTransition, selectedSlide, handleSlideSelection];
};

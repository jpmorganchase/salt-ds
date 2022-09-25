import { LayoutAnimationTransition } from "@jpmorganchase/uitk-core/src/layout/types";
import { useState } from "react";

export const useSlideSelection = (
  initialValue?: number
): [
  LayoutAnimationTransition | undefined,
  number,
  (sliderIndex: number, transition?: LayoutAnimationTransition) => void
] => {
  const [selectedSlide, setSelectedSlide] = useState(initialValue || 0);
  const [selectedTransition, setSelectedTransition] = useState<
    LayoutAnimationTransition | undefined
  >(undefined);

  const handleSlideSelection = (
    sliderIndex: number,
    transition?: LayoutAnimationTransition
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

import {
  useDensity,
  useFormFieldProps,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import { MutableRefObject } from "react";

const refreshButtonWidth = {
  touch: 36,
  low: 28,
  medium: 24,
  high: 12,
};

// The activation indicator icon is absolutely positioned by FormField,
// and must be offset to accommodate the end adornment added by Stepper Input.
// Ideally, we should be able to provide an 'activationIndicator' class to FormField to
// override its default positioning instead of directly repositioning it via its ref.
export function useActivationIndicatorPosition(
  adornmentRef: MutableRefObject<HTMLDivElement | null>,
  refreshButtonVisible: boolean
) {
  const formFieldProps = useFormFieldProps();
  const { ref: formFieldRef } = formFieldProps;
  const density = useDensity();

  useIsomorphicLayoutEffect(() => {
    let offset;
    if (adornmentRef && adornmentRef.current !== null) {
      const marginAdjustment =
        density === "high" || density === "medium" ? 2 : 4;

      const secondaryButtonAdjustment = refreshButtonVisible
        ? 0
        : refreshButtonWidth[density];

      offset =
        adornmentRef.current.getBoundingClientRect().width -
        marginAdjustment -
        secondaryButtonAdjustment;
    }
    if (formFieldRef && formFieldRef.current && offset) {
      const activationIndicator = formFieldRef.current.getElementsByClassName(
        "uitkFormActivationIndicator-icon"
      ) as HTMLCollectionOf<HTMLElement>;
      if (activationIndicator.length > 0) {
        activationIndicator[0].style.transform = `translateX(-${offset}px)`;
      }
    }
  });
}

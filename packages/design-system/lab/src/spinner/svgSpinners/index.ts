import { SpinnerSmall } from "./SpinnerSmall";
import { SpinnerMedium } from "./SpinnerMedium";
import { SpinnerLarge } from "./SpinnerLarge";

export const getSvgSpinner = (size: string) => {
  switch (size) {
    case "small":
      return SpinnerSmall;
    case "large":
      return SpinnerLarge;
    default:
      return SpinnerMedium;
  }
};

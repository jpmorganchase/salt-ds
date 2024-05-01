import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";
import { getPercentage } from "./utils";
import { useSliderContext } from "./SliderContext";

const withBaseName = makePrefixer("saltSliderSelection");

export interface SliderSelectionProps extends ComponentPropsWithoutRef<"div"> {}

export function SliderSelection({
  ...props
}: SliderSelectionProps): JSX.Element {
  const { min, max, value } = useSliderContext();

  const percentage = getPercentage(min, max, value);

  return (
    <div
      className={withBaseName()}
      style={{ width: `${percentage}` }}
      {...props}
    />
  );
}

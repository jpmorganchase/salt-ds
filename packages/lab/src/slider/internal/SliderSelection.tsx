import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";

const withBaseName = makePrefixer("saltSliderSelection");

export interface SliderSelectionProps extends ComponentPropsWithoutRef<"div"> {}

export function SliderSelection({
  ...props
}: SliderSelectionProps): JSX.Element {
  return <div className={withBaseName()} {...props} />;
}

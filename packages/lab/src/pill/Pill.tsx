import { ForwardedRef, forwardRef, ReactElement } from "react";

import { ClosablePill, ClosablePillProps } from "./ClosablePill";
import { PillBase, PillBaseProps } from "./PillBase";
import { SelectablePill, SelectablePillProps } from "./SelectablePill";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import pillCss from "./Pill.css";

export type PillVariant = "basic" | "closable" | "selectable";

export interface PillVariantProps<T extends PillVariant = "basic"> {
  /**
   * Determines the variant of pill
   */
  variant?: T;
}

// Generic checks makes sure that incompatiable props like `onChange` can be inferred correctly when using different variants
export type PillProps<T extends PillVariant = "basic"> = T extends "closable"
  ? ClosablePillProps & PillVariantProps<T>
  : T extends "basic"
  ? PillBaseProps & PillVariantProps<T>
  : SelectablePillProps & PillVariantProps<T>;

const getVariant = (deletable?: boolean, variantProp?: PillVariant) => {
  if (variantProp) {
    return variantProp;
  } else {
    return deletable !== undefined ? "closable" : "basic";
  }
};

export const Pill = forwardRef(function Pill(
  { variant: variantProp, ...restProps }: PillProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pill",
    css: pillCss,
    window: targetWindow,
  });
  const variant = getVariant(restProps.deletable, variantProp);
  if (variant === "selectable") {
    return <SelectablePill {...(restProps as SelectablePillProps)} ref={ref} />;
  } else if (variant === "closable") {
    return <ClosablePill {...restProps} ref={ref} />;
  } else {
    return <PillBase clickable {...restProps} ref={ref} />;
  }
}) as <T extends PillVariant = "basic">(
  p: PillProps<T> & { ref?: ForwardedRef<HTMLDivElement> }
) => ReactElement<PillProps<T>>;

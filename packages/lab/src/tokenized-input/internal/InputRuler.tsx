import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type ForwardedRef, forwardRef, type InputHTMLAttributes } from "react";
import inputRuler from "./InputRuler.css";

const withBaseName = makePrefixer("saltInputRuler");

/**
 * This hidden component is used to wrap a copy of an input value
 * so that we can use it to determine the input width dynamically
 */
export const InputRuler = forwardRef(function InputRuler(
  props: { value: InputHTMLAttributes<HTMLInputElement>["value"] },
  ref: ForwardedRef<HTMLSpanElement>,
) {
  const { value } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-input-ruler",
    css: inputRuler,
    window: targetWindow,
  });

  return (
    <span className={withBaseName()} ref={ref}>
      {value}
    </span>
  );
});

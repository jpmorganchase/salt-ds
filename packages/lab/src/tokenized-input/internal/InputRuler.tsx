import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";
import { makePrefixer } from "@salt-ds/core";
import inputRuler from "./InputRuler.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltInputRuler");

/**
 * This hidden component is used to wrap a copy of an input value
 * so that we can use it to determine the input width dynamically
 */
export const InputRuler = forwardRef(function InputRuler(
  props: { value: InputHTMLAttributes<HTMLInputElement>["value"] },
  ref: ForwardedRef<HTMLSpanElement>
) {
  const { value } = props;

  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-input-ruler",
    css: inputRuler,
    window: targetWindow,
  });

  return (
    <span className={withBaseName()} ref={ref}>
      {value}
    </span>
  );
});

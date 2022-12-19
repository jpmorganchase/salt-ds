import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";
import { makePrefixer } from "@salt-ds/core";
import "./InputRuler.css";

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

  return (
    <span className={withBaseName()} ref={ref}>
      {value}
    </span>
  );
});

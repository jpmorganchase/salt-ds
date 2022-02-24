import { forwardRef, HTMLAttributes } from "react";

export interface ValueComponentProps extends HTMLAttributes<HTMLSpanElement> {
  value?: string;
}

export const DefaultValueComponent = forwardRef<
  HTMLSpanElement,
  ValueComponentProps
>(function DefaultValueComponent(props, ref) {
  const { value, ...restProps } = props;
  return (
    <span {...restProps} ref={ref}>
      {value}
    </span>
  );
});

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer, useId } from "../utils";
import optionGroupCss from "./OptionGroup.css";

export interface OptionGroupProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The label of the option group.
   */
  label?: string;
  /**
   * Options to be rendered inside the option group.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltOptionGroup");
export const OptionGroup = forwardRef<HTMLDivElement, OptionGroupProps>(
  function OptionGroup(props, ref) {
    const { className, children, label, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-option-group",
      css: optionGroupCss,
      window: targetWindow,
    });

    const labelId = useId();

    return (
      <div
        aria-labelledby={labelId}
        className={clsx(withBaseName(), className)}
        role="group"
        ref={ref}
        {...rest}
      >
        <div aria-hidden className={withBaseName("label")} id={labelId}>
          {label}
        </div>
        {children}
      </div>
    );
  },
);

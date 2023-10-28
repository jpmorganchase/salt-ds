import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { makePrefixer, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import optionGroupCss from "./OptionGroup.css";

export interface OptionGroupProps extends ComponentPropsWithoutRef<"div"> {
  label?: string;
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
        <div aria-hidden className={withBaseName("label")}>
          {label}
        </div>
        {children}
      </div>
    );
  }
);

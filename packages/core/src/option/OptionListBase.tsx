import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import optionListCss from "./OptionList.css";

const withBaseName = makePrefixer("saltOptionList");

export interface OptionListBaseProps extends ComponentPropsWithoutRef<"div"> {}

export const OptionListBase = forwardRef<HTMLDivElement, OptionListBaseProps>(
  function OptionListBase(props, ref) {
    const { children, className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-option-list",
      css: optionListCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(withBaseName("container"), className)}
        {...rest}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

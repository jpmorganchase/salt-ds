import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import optionListCss from "./OptionList.css";

export interface OptionListProps extends ComponentPropsWithoutRef<"div"> {
  collapsed?: boolean;
}

const withBaseName = makePrefixer("saltOptionList");

export const OptionList = forwardRef<HTMLDivElement, OptionListProps>(
  function OptionList(props, ref) {
    const { children, className, collapsed, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-option-list",
      css: optionListCss,
      window: targetWindow,
    });

    return (
      <div
        role="listbox"
        className={clsx(
          withBaseName(),
          {
            [withBaseName("collapsed")]: collapsed,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

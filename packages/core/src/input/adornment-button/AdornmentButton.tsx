import { ForwardedRef, forwardRef } from "react";
import { Button, ButtonProps, makePrefixer, useFormFieldProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import AdornmentButtonCss from "./AdornmentButton.css";

export type AdornmentButtonProps = ButtonProps;

const withBaseName = makePrefixer("saltAdornmentButton");

export const AdornmentButton = forwardRef(function AdornmentButton(
  { children, disabled, variant, ...rest }: AdornmentButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-adornment-button",
    css: AdornmentButtonCss,
    window: targetWindow,
  });

  const { disabled: formFieldDisabled } = useFormFieldProps();
  
  const isDisabled = disabled || formFieldDisabled;

  return (
    <Button
      className={withBaseName()}
      disabled={isDisabled}
      variant={variant}
      {...rest}
      ref={ref}
    >
      {children}
    </Button>
  );
});

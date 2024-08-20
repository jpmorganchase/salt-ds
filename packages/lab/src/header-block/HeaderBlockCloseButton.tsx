import { CloseIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { forwardRef } from "react";
import { Button, type ButtonProps, makePrefixer } from "@salt-ds/core";

import headerBlockCloseButtonCss from "./HeaderBlockCloseButton.css";

const withBaseName = makePrefixer("saltHeaderBlockCloseButton");

export const HeaderBlockCloseButton = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function HeaderBlockCloseButton({ className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-header-block-close-button",
    css: headerBlockCloseButtonCss,
    window: targetWindow,
  });

  return (
    <Button
      ref={ref}
      aria-label="Close dialog"
      variant="secondary"
      className={clsx(withBaseName(), className)}
      {...rest}
    >
      <CloseIcon aria-hidden />
    </Button>
  );
});

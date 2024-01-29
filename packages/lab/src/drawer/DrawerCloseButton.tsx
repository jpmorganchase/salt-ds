import { forwardRef } from "react";
import clsx from "clsx";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { CloseIcon } from "@salt-ds/icons";

import drawerCloseButtonCss from "./DrawerCloseButton.css";

const withBaseName = makePrefixer("saltDrawerCloseButton");

export const DrawerCloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function DrawerCloseButton({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-drawer-close-button",
      css: drawerCloseButtonCss,
      window: targetWindow,
    });

    return (
      <div className={withBaseName("container")}>
        <Button
          ref={ref}
          aria-label="Close Drawer"
          variant="secondary"
          className={clsx(withBaseName(), className)}
          {...rest}
        >
          <CloseIcon aria-hidden />
        </Button>
      </div>
    );
  }
);

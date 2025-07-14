import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { Button, type ButtonProps } from "../button";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer } from "../utils";

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
    const { CloseIcon } = useIcon();

    return (
      <div className={withBaseName("container")}>
        <Button
          ref={ref}
          aria-label="Close Drawer"
          appearance="transparent"
          className={clsx(withBaseName(), className)}
          {...rest}
        >
          <CloseIcon aria-hidden />
        </Button>
      </div>
    );
  },
);

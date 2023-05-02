import { forwardRef } from "react";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

import "./BannerCloseButton.css";

const withBaseName = makePrefixer("saltBannerClose");

export const BannerCloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function Banner(props, ref) {
    return (
      <Button
        aria-label="close"
        className={withBaseName()}
        ref={ref}
        variant="secondary"
        {...props}
      >
        <CloseIcon />
      </Button>
    );
  }
);

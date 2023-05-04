import { forwardRef, MouseEvent } from "react";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { useBannerContext } from "./BannerContext";

import "./BannerCloseButton.css";

const withBaseName = makePrefixer("saltBannerClose");

export const BannerCloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function Banner(props, ref) {
    const { onClick, ...restProps } = props;

    const { onClose } = useBannerContext();

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      console.log('handleClick');
      onClose?.();
      onClick?.(e);

    };

    return (
      <Button
        aria-label="close"
        className={withBaseName()}
        ref={ref}
        variant="secondary"
        onClick={handleClick}
        {...restProps}
      >
        <CloseIcon />
      </Button>
    );
  }
);

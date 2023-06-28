import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes, ReactNode } from "react";
import {
  Banner,
  BannerActions,
  BannerContent,
  BannerProps,
  Button,
  makePrefixer,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  status?: BannerProps["status"];
  variant?: "primary" | "secondary";
  onClose?: () => void;
}

export const Toast = forwardRef(function Toast(
  { children, onClose, status = "info", variant, ...restProps }: ToastProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast",
    css: toastCss,
    window: targetWindow,
  });

  const handleOnClick = () => {
    onClose?.();
  };

  return (
    <div className={clsx(withBaseName())} {...restProps} ref={ref}>
      <Banner status={status} variant={variant}>
        <BannerContent>{children}</BannerContent>
        <BannerActions>
          <Button variant="secondary" onClick={handleOnClick}>
            <CloseIcon />
          </Button>
        </BannerActions>
      </Banner>
    </div>
  );
});

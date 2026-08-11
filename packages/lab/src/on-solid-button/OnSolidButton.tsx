import { Button, type ButtonProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";

import onSolidButtonCss from "./OnSolidButton.css";

const withBaseName = makePrefixer("saltOnSolidButton");

export interface OnSolidButtonProps
  extends Omit<
    ButtonProps,
    "appearance" | "sentiment" | "variant" | "loading" | "loadingAnnouncement"
  > {}

export const OnSolidButton = forwardRef<HTMLButtonElement, OnSolidButtonProps>(
  function OnSolidButton({ className, ...props }, ref) {
    // Dropped at runtime as well as in the type,
    const {
      appearance: _appearance,
      sentiment: _sentiment,
      variant: _variant,
      loading: _loading,
      loadingAnnouncement: _loadingAnnouncement,
      ...rest
    } = props as ButtonProps;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-on-solid-button",
      css: onSolidButtonCss,
      window: targetWindow,
    });

    return (
      <Button
        {...rest}
        ref={ref}
        appearance="transparent"
        className={clsx(withBaseName(), className)}
      />
    );
  },
);

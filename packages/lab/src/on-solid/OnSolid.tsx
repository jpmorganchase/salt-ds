import { Button, type ButtonProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";

import onSolidCss from "./OnSolid.css";

const withBaseName = makePrefixer("saltOnSolid");

export interface OnSolidProps
  extends Omit<
    ButtonProps,
    "appearance" | "sentiment" | "variant" | "loading" | "loadingAnnouncement"
  > {}

export const OnSolid = forwardRef<HTMLButtonElement, OnSolidProps>(
  function OnSolid({ className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-on-solid",
      css: onSolidCss,
      window: targetWindow,
    });

    return (
      <Button
        ref={ref}
        appearance="transparent"
        className={clsx(withBaseName(), className)}
        {...rest}
      />
    );
  },
);

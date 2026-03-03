import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";

import kbdCss from "./Kbd.css";

export interface KbdProps extends ComponentPropsWithoutRef<"kbd"> {
  /**
   * The variant of the kbd. Defaults to `"primary"`.
   */
  variant?: "primary" | "secondary" | "tertiary";
}

const withBaseName = makePrefixer("saltKbd");

export const Kbd = forwardRef<HTMLDivElement, KbdProps>(
  function Kbd(props, ref) {
    const { children, className, variant = "primary", ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-kbd",
      css: kbdCss,
      window: targetWindow,
    });

    return (
      <kbd
        ref={ref}
        className={clsx(withBaseName(), withBaseName(variant), className)}
        {...rest}
      >
        {children}
      </kbd>
    );
  },
);

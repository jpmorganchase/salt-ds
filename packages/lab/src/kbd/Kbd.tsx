import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import kbdCss from "./Kbd.css";

export interface KbdProps extends ComponentPropsWithoutRef<"kbd"> {}

const withBaseName = makePrefixer("saltKbd");

export const Kbd = forwardRef<HTMLDivElement, KbdProps>(
  function Kbd(props, ref) {
    const { children, className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-kbd",
      css: kbdCss,
      window: targetWindow,
    });

    return (
      <kbd ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        {children}
      </kbd>
    );
  },
);

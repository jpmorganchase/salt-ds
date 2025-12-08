import {
  makePrefixer,
  Text
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useEffect, useState } from "react";
import { useIsViewportLargerThanBreakpoint } from "../utils";

import keyboardKeyCss from "./KeyboardKey.css";

export interface KeyboardKeyProps extends HTMLAttributes<HTMLElement> {

}

const withBaseName = makePrefixer("saltKeyboardKey");

export const KeyboardKey = forwardRef<HTMLDivElement, KeyboardKeyProps>(
  function KeyboardKey(props, ref) {
    const {
      children,
      className,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-keyboard-key",
      css: keyboardKeyCss,
      window: targetWindow,
    });

    return (
      <kbd ref={ref}
        className={clsx(withBaseName(), className, {
        })}  {...props}>
        <Text>{children}</Text>
      </kbd>
    );
  },
);

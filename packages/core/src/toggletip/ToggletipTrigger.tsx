import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer, useForkRef } from "../utils";
import { useToggletipContext } from "./ToggletipContext";
import toggletipTriggerCss from "./ToggletipTrigger.css";

export interface ToggletipTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltToggletipTrigger");

export const ToggletipTrigger = forwardRef<
  HTMLButtonElement,
  ToggletipTriggerProps
>(function ToggletipTrigger(props, ref) {
  const { children, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toggletip-trigger",
    css: toggletipTriggerCss,
    window: targetWindow,
  });

  const { setReference, getReferenceProps } = useToggletipContext();

  const handleRef = useForkRef<HTMLButtonElement>(setReference, ref);

  return (
    <button
      type="button"
      {...getReferenceProps({
        ref: handleRef,
        className: clsx(withBaseName(), className),
        ...rest,
      })}
    >
      {children}
    </button>
  );
});

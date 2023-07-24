import { clsx } from "clsx";
import {
  ComponentPropsWithoutRef,
  RefObject,
  forwardRef,
  useLayoutEffect,
  useRef,
} from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useForkRef } from "../utils";
import { StatusIndicator, ValidationStatus } from "../status-indicator";

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends ComponentPropsWithoutRef<"div"> {
  /**
   *  A string to determine the current state of the Toast.
   */
  status?: ValidationStatus;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  props,
  ref
) {
  const { children, className, status = "info", ...rest } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast",
    css: toastCss,
    window: targetWindow,
  });

  const toastRef = useRef<HTMLDivElement>();
  const handleRef = useForkRef(toastRef, ref);
  useLayoutEffect(() => {
    toastRef.current?.scrollIntoView();
  }, []);

  return (
    <div
      className={clsx(withBaseName(), withBaseName(status), className)}
      role="alert"
      {...rest}
      ref={handleRef as RefObject<HTMLDivElement>}
    >
      <StatusIndicator status={status} className={withBaseName("icon")} />
      {children}
    </div>
  );
});

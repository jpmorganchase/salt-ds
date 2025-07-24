import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import systemStatusActionsCss from "./SystemStatusActions.css";

const withBaseName = makePrefixer("saltSystemStatusActions");

interface SystemStatusActionsProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of SystemStatusActions
   */
  children: ReactNode;
}

export const SystemStatusActions = forwardRef<
  HTMLDivElement,
  SystemStatusActionsProps
>(function SystemStatusActions(props, ref) {
  const { className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-system-status-actions",
    css: systemStatusActionsCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
  );
});

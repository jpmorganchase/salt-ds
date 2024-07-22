import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import systemStatusContentCss from "./SystemStatusContent.css";

const withBaseName = makePrefixer("saltSystemStatusContent");

interface SystemStatusContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of SystemStatusContent
   */
  children: ReactNode;
}

export const SystemStatusContent = forwardRef<
  HTMLDivElement,
  SystemStatusContentProps
>(function SystemStatusContent(props, ref) {
  const { className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-system-status-content",
    css: systemStatusContentCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
  );
});

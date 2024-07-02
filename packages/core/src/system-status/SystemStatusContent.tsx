import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";

import systemStatusContentCss from "./SystemStatusContent.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

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

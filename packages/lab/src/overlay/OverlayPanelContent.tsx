import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer } from "@salt-ds/core";
import { ReactNode, HTMLAttributes, forwardRef } from "react";
import clsx from "clsx";
import overlayPanelContentCss from "./OverlayPanelContent.css";

const withBaseName = makePrefixer("saltOverlayPanelContent");

export interface OverlayPanelContentProps
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of Overlay Panel
   */
  children?: ReactNode;
}

export const OverlayPanelContent = forwardRef<
  HTMLDivElement,
  OverlayPanelContentProps
>(function OverlayPanelContent(props, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay-panel-content",
    css: overlayPanelContentCss,
    window: targetWindow,
  });

  const { children, className, ...rest } = props;

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref}>
      {children}
    </div>
  );
});

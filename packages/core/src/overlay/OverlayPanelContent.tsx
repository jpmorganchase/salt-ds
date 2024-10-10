import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import { makePrefixer } from "../utils";
import overlayPanelContentCss from "./OverlayPanelContent.css";

const withBaseName = makePrefixer("saltOverlayPanelContent");

export interface OverlayPanelContentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of Overlay Panel Content
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

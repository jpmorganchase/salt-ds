import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import overlayPanelContentCss from "./OverlayPanelContent.css";

const withBaseName = makePrefixer("saltOverlayPanelContent");

export const OverlayPanelContent = (props: ComponentPropsWithoutRef<"div">) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay-panel-content",
    css: overlayPanelContentCss,
    window: targetWindow,
  });

  const { children, className, ...rest } = props;

  return (
    <div className={clsx(withBaseName(), className)} {...rest}>
      {children}
    </div>
  );
};

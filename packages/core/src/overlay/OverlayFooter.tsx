import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import overlayFooterCss from "./OverlayFooter.css";

export interface OverlayFooterProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltOverlayFooter");

export const OverlayFooter = forwardRef<HTMLDivElement, OverlayFooterProps>(
  function OverlayFooter(props, ref) {
    const { className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-overlay-footer",
      css: overlayFooterCss,
      window: targetWindow,
    });

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest} />
    );
  },
);

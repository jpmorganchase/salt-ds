import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer } from "../utils";
import bannerActionsCss from "./BannerActions.css";

const withBaseName = makePrefixer("saltBannerActions");

interface BannerActionsProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of BannerActions
   */
  children: ReactNode;
}

export const BannerActions = forwardRef<HTMLDivElement, BannerActionsProps>(
  function BannerActions(props, ref) {
    const { className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-banner-actions",
      css: bannerActionsCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
    );
  },
);

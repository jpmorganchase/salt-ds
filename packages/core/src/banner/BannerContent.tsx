import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import bannerContentCss from "./BannerContent.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

const withBaseName = makePrefixer("saltBannerContent");

export const BannerContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function BannerContent(props, ref) {
  const { className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-banner-content",
    css: bannerContentCss,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
  );
});

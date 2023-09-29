import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";

import bannerContentCss from "./BannerContent.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

const withBaseName = makePrefixer("saltBannerContent");

interface BannerContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of BannerContent
   */
  children: ReactNode;
}

export const BannerContent = forwardRef<HTMLDivElement, BannerContentProps>(
  function BannerContent(props, ref) {
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
  }
);

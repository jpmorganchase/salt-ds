import { ReactNode } from "react";
import { makePrefixer } from "@salt-ds/core";

import bannerCss from "./BannerContent.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

const withBaseName = makePrefixer("saltBannerContent");

export const BannerContent = ({ children }: { children: ReactNode }) => {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    testId: "salt-banner",
    css: bannerCss,
    window: targetWindow,
  });

  return <span className={withBaseName()}>{children}</span>;
};

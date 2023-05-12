import { ReactNode } from "react";
import { makePrefixer } from "@salt-ds/core";

import "./BannerContent.css";

const withBaseName = makePrefixer("saltBannerContent");

export const BannerContent = ({ children }: { children: ReactNode }) => {
  return <span className={withBaseName()}>{children}</span>;
};

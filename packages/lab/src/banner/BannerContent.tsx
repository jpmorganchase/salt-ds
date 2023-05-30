import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import "./BannerContent.css";

const withBaseName = makePrefixer("saltBannerContent");

export const BannerContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function BannerContent(props, ref) {
  const { className, ...rest } = props;
  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
  );
});

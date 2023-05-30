import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import "./BannerActions.css";

const withBaseName = makePrefixer("saltBannerActions");

export const BannerActions = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function BannerActions(props, ref) {
  const { className, ...rest } = props;
  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
  );
});

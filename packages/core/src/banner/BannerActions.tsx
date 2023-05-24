import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import "./BannerActions.css";

const withBaseName = makePrefixer("saltBannerActions");

export interface BannerActionsProps extends ComponentPropsWithoutRef<"div"> {}

export const BannerActions = forwardRef<HTMLDivElement, BannerActionsProps>(
  function BannerActions(props, ref) {
    const { className, ...rest } = props;
    return (
      <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
    );
  }
);

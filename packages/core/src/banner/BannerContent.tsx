import { ComponentPropsWithoutRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import "./BannerContent.css";

const withBaseName = makePrefixer("saltBannerContent");

export interface BannerContentProps extends ComponentPropsWithoutRef<"div"> {}

export const BannerContent = forwardRef<HTMLDivElement, BannerContentProps>(
  function BannerContent(props, ref) {
    const { className, ...rest } = props;
    return (
      <div className={clsx(withBaseName(), className)} {...rest} ref={ref} />
    );
  }
);

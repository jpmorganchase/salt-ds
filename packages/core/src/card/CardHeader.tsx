import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import cardHeaderCss from "./CardHeader.css";

export interface CardHeaderProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCardHeader");

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(props, ref) {
    const { className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-card-header",
      css: cardHeaderCss,
      window: targetWindow,
    });

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest} />
    );
  },
);

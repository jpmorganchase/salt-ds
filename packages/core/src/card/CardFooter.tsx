import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import cardFooterCss from "./CardFooter.css";

export interface CardFooterProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCardFooter");

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter(props, ref) {
    const { className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-card-footer",
      css: cardFooterCss,
      window: targetWindow,
    });

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest} />
    );
  },
);

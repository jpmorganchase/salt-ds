import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import cardContentCss from "./CardContent.css";

export interface CardContentProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCardContent");

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent(props, ref) {
    const { className, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-card-content",
      css: cardContentCss,
      window: targetWindow,
    });

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest} />
    );
  },
);

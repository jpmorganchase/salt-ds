import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useIsomorphicLayoutEffect } from "../utils";
import cardContentCss from "./CardContent.css";
import { useCardContext } from "./CardContext";

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

    const { setNoPadding } = useCardContext();

    useIsomorphicLayoutEffect(() => {
      setNoPadding(true);

      return () => {
        setNoPadding(false);
      };
    }, [setNoPadding]);

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest} />
    );
  },
);

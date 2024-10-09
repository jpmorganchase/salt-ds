import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef, useLayoutEffect } from "react";
import { makePrefixer, useIsomorphicLayoutEffect } from "../utils";
import cardContentCss from "./CardContent.css";
import { useCardContext } from "./CardContext";

export interface CardContentProps extends ComponentPropsWithRef<"div"> {}

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

    const { setPadding } = useCardContext();

    useIsomorphicLayoutEffect(() => {
      setPadding(false);

      return () => {
        setPadding(true);
      };
    }, [setPadding]);

    return (
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest} />
    );
  },
);

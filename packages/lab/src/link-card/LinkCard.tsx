import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import { capitalize, makePrefixer } from "@salt-ds/core";

import linkCardCss from "./LinkCard.css";

const withBaseName = makePrefixer("saltLinkCard");

export interface LinkCardProps extends ComponentPropsWithoutRef<"a"> {
  /**
   * Accent border position: defaults to "bottom"
   */
  accent?: "bottom" | "top" | "left" | "right";
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

export const LinkCard = forwardRef<HTMLAnchorElement, LinkCardProps>(
  function LinkCard(props, ref) {
    const {
      accent = "bottom",
      children,
      className,
      href,
      variant = "primary",
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-link-card",
      css: linkCardCss,
      window: targetWindow,
    });

    return (
      <a
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          withBaseName(`accent${capitalize(accent)}`),
          className
        )}
        href={href}
        {...rest}
        ref={ref}
      >
        {children}
      </a>
    );
  }
);

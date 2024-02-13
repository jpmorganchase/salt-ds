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
  accentPlacement?: "bottom" | "top" | "left" | "right";
  /**
   * If `true`, the card will be disabled.
   */
  disabled?: boolean;
  /**
   * Card size; adjusts the padding.
   */
  size?: "small" | "medium" | "large";
  /**
   * Styling variant; defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

export const LinkCard = forwardRef<HTMLAnchorElement, LinkCardProps>(
  function LinkCard(props, ref) {
    const {
      accentPlacement = "bottom",
      children,
      className,
      href,
      size = "large",
      variant = "primary",
      disabled,
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
          withBaseName(size),
          withBaseName(variant),
          withBaseName(`accent${capitalize(accentPlacement)}`),
          {
            [withBaseName("disabled")]: disabled,
          },
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

import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import linkButtonCss from "./LinkButton.css";

const withBaseName = makePrefixer("saltLinkButton");

export interface LinkButtonProps extends ComponentPropsWithoutRef<"a"> {
  /**
   * The sentiment of the button. Options are 'accented' and 'neutral'.
   * 'neutral' is the default value.
   *
   * @since 1.36.0.
   */
  sentiment?: "accented" | "neutral";
  /**
   * Render prop to enable customisation of anchor element.
   */
  render?: RenderPropsType["render"];
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(props, ref) {
    const { className, sentiment = "neutral", ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-link-button",
      css: linkButtonCss,
      window: targetWindow,
    });

    return renderProps("a", {
      className: clsx(withBaseName(), withBaseName(sentiment), className),
      ...rest,
      ref,
    });
  },
);

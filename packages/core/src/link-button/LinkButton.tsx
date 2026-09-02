import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  cloneElement,
  forwardRef,
} from "react";
import { useButton } from "../button";
import { useIcon } from "../semantic-icon-provider";
import {
  capitalize,
  makePrefixer,
  type RenderPropsType,
  renderProps,
} from "../utils";

import linkButtonCss from "./LinkButton.css";

const withBaseName = makePrefixer("saltLinkButton");

export interface LinkButtonProps extends ComponentPropsWithoutRef<"a"> {
  /**
   * Icon component displayed when `target="_blank"`. Defaults to `ExternalIcon` from `SemanticIconProvider`.
   */
  IconComponent?: ComponentType<IconProps> | null;
  /**
   * The sentiment of the button. Options are 'accented' and 'neutral'.
   * 'neutral' is the default value.
   */
  sentiment?: "accented" | "neutral";
  /**
   * Render prop to enable customisation of anchor element.
   */
  render?: RenderPropsType["render"];
  /**
   * Either "default" or "never".
   * Determines when underline should be applied to the link button.
   *
   * @default "default".
   */
  underline?: "default" | "never";
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(props, ref) {
    const {
      children,
      className,
      IconComponent,
      onBlur,
      onClick,
      onKeyDown,
      onKeyUp,
      sentiment = "neutral",
      target = "_self",
      underline = "default",
      ...rest
    } = props;

    const { active, buttonProps } = useButton<HTMLAnchorElement>({
      onBlur,
      onClick,
      onKeyDown,
      onKeyUp,
    });
    // Native anchors with an href do not require tabIndex="0".
    const { tabIndex: _tabIndex, ...activeStateProps } = buttonProps;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-link-button",
      css: linkButtonCss,
      window: targetWindow,
    });
    const { ExternalIcon } = useIcon();

    const LinkButtonIconComponent =
      IconComponent === undefined ? ExternalIcon : IconComponent;

    const linkButton = renderProps("a", {
      className: clsx(
        withBaseName(),
        withBaseName(sentiment),
        withBaseName(`underline${capitalize(underline)}`),
        { [withBaseName("active")]: active },
        className,
      ),
      ...activeStateProps,
      ...rest,
      ref,
      target,
      children,
    });

    if (linkButton.props.target !== "_blank") {
      return linkButton;
    }

    return cloneElement(
      linkButton,
      undefined,
      <>
        {linkButton.props.children}
        {LinkButtonIconComponent && (
          <LinkButtonIconComponent
            className={withBaseName("icon")}
            aria-hidden
          />
        )}
        <span className={withBaseName("externalLinkADA")}>
          Opens in a new tab
        </span>
      </>,
    );
  },
);

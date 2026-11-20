import type { IconProps } from "@salt-ds/icons";
import {
  useComponentCssInjection,
  useComponentDefaults,
} from "@salt-ds/styles";
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
   * The icon component displayed when `target` is `"_blank"`. Defaults to the
   * `ExternalIcon` from `SemanticIconProvider`. Pass `null` to hide the icon.
   */
  IconComponent?: ComponentType<IconProps> | null;
  /**
   * The sentiment of the link button.
   * @default "neutral"
   */
  sentiment?: "accented" | "neutral";
  /**
   * Render prop to enable customization of anchor element.
   */
  render?: RenderPropsType["render"];
  /**
   * When the link button is underlined. `"default"` underlines it except while
   * it's hovered or focused, and `"never"` doesn't underline it.
   * @default "default"
   */
  underline?: "default" | "never";
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(props, ref) {
    const { props: propsWithDefaults, rootDataAttributes } =
      useComponentDefaults("saltLinkButton", props);

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
    } = propsWithDefaults;

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
      ...rootDataAttributes,
      ref,
      target,
      children,
    });

    const linkButtonProps = linkButton.props as ComponentPropsWithoutRef<"a">;

    if (linkButtonProps.target !== "_blank") {
      return linkButton;
    }

    return cloneElement(
      linkButton,
      undefined,
      <>
        {linkButtonProps.children}
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

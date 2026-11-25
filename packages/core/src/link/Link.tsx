import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  forwardRef,
  type ReactElement,
} from "react";
import { useIcon } from "../semantic-icon-provider";
import { Text, type TextProps } from "../text";
import { capitalize, makePrefixer, type RenderPropsType } from "../utils";
import linkCss from "./Link.css";
import { LinkAction } from "./LinkAction";

const withBaseName = makePrefixer("saltLink");

/**
 * Links are a fundamental navigation element. When clicked, they take the user to an entirely different page.
 *
 * @example
 * <LinkExample to="#link">Action</LinkExample>
 */
export interface LinkProps
  extends Omit<ComponentPropsWithoutRef<"a">, "color">,
    Pick<TextProps<"a">, "maxRows" | "styleAs" | "variant"> {
  /**
   * The icon component displayed for external links, when `target` is
   * `"_blank"`. Defaults to the `ExternalIcon` from `SemanticIconProvider`. Pass
   * `null` to hide the icon.
   */
  IconComponent?: ComponentType<IconProps> | null;
  /**
   * Render prop to enable customization of anchor element.
   */
  render?: RenderPropsType["render"];
  /**
   * The color of the text.
   * @default "primary"
   */
  color?: "inherit" | "primary" | "secondary" | "accent";
  /**
   * When the link is underlined. `"default"` underlines the link except while
   * it's hovered or focused, and `"never"` doesn't underline it.
   * @default "default"
   */
  underline?: "default" | "never";
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    IconComponent,
    href,
    className,
    children,
    color: colorProp,
    variant,
    target = "_self",
    underline = "default",
    ...rest
  },
  ref,
): ReactElement<LinkProps> {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-link",
    css: linkCss,
    window: targetWindow,
  });
  const { ExternalIcon } = useIcon();

  const color = variant ?? colorProp ?? "primary";
  const LinkIconComponent =
    IconComponent === undefined ? ExternalIcon : IconComponent;

  return (
    <Text
      as={LinkAction}
      className={clsx(
        withBaseName(),
        withBaseName(`underline${capitalize(underline)}`),
        {
          [withBaseName(color)]: color !== "inherit",
        },
        className,
      )}
      href={href}
      ref={ref}
      target={target}
      color="inherit"
      externalLinkContent={
        <>
          {LinkIconComponent && (
            <LinkIconComponent className={withBaseName("icon")} aria-hidden />
          )}
          <span className={withBaseName("externalLinkADA")}>
            Opens in a new tab
          </span>
        </>
      }
      {...rest}
    >
      {children}
    </Text>
  );
});

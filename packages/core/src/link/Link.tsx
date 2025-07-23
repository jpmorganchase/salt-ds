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
   * Icon component displayed for external links. Defaults to `ExternalIcon` from `SemanticIconProvider`.
   */
  IconComponent?: ComponentType<IconProps> | null;
  /**
   * Render prop to enable customisation of anchor element.
   */
  render?: RenderPropsType["render"];
  /*
   * The color of the text. Defaults to "primary".
   */
  color?: "inherit" | "primary" | "secondary" | "accent";
  /**
   *
   * Either "default" or "never".
   * Determines when underline should be applied to the link.
   *
   * @default "default".
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
      {...rest}
    >
      {children}
      {target === "_blank" && (
        <>
          {LinkIconComponent && (
            <LinkIconComponent className={withBaseName("icon")} aria-hidden />
          )}
          <span className={withBaseName("externalLinkADA")}>
            Opens in a new tab
          </span>
        </>
      )}
    </Text>
  );
});

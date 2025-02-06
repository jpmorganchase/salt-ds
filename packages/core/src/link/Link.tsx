import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactElement,
  forwardRef,
} from "react";
import { useIcon } from "../semantic-icon-provider";
import { Text, type TextProps } from "../text";
import { type RenderPropsType, makePrefixer } from "../utils";
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
  IconComponent?: ComponentType<IconProps> | null;
  /**
   * Render prop to enable customisation of anchor element.
   */
  render?: RenderPropsType["render"];
  /*
   * The color of the text. Defaults to "primary".
   */
  color?: "inherit" | "primary" | "secondary" | "accent";
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
          <span className={withBaseName("externalLinkADA")}>External</span>
        </>
      )}
    </Text>
  );
});

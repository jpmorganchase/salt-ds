import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentType, type ReactElement, forwardRef } from "react";
import { useIcon } from "../semantic-icon-provider";
import { Text, type TextProps } from "../text";
import { makePrefixer } from "../utils";
import linkCss from "./Link.css";

const withBaseName = makePrefixer("saltLink");

/**
 * Links are a fundamental navigation element. When clicked, they take the user to an entirely different page.
 *
 * @example
 * <LinkExample to="#link">Action</LinkExample>
 */
export interface LinkProps extends Omit<TextProps<"a">, "as" | "disabled"> {
  IconComponent?: ComponentType<IconProps> | null;
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
      as="a"
      className={clsx(withBaseName(), className)}
      href={href}
      ref={ref}
      target={target}
      color={color}
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

import { ComponentType, forwardRef, ReactElement } from "react";
import { clsx } from "clsx";
import { IconProps, TearOutIcon } from "@salt-ds/icons";
import { makePrefixer } from "../utils";
import { Text, TextProps } from "../text";

import "./Link.css";

const withBaseName = makePrefixer("saltLink");

/**
 * Links are a fundamental navigation element. When clicked, they take the user to an entirely different page.
 *
 * @example
 * <LinkExample to="#link">Action</LinkExample>
 */
export interface LinkProps extends Omit<TextProps<"a">, "as"> {
  IconComponent?: ComponentType<IconProps>;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    IconComponent = TearOutIcon,
    href,
    className,
    children,
    variant = "primary",
    target = "_self",
    ...rest
  },
  ref
): ReactElement<LinkProps> {
  return (
    <Text
      as="a"
      className={clsx(withBaseName(), className)}
      href={href}
      ref={ref}
      target={target}
      variant={variant}
      {...rest}
    >
      {children}
      {target === "_blank" && (
        <>
          <IconComponent className={withBaseName("icon")} aria-hidden />
          <span className={withBaseName("externalLinkADA")}>External Link</span>
        </>
      )}
    </Text>
  );
});

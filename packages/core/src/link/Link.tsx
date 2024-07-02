import { type IconProps, TearOutIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { type ComponentType, type ReactElement, forwardRef } from "react";
import { Text, type TextProps } from "../text";
import { makePrefixer } from "../utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
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
    IconComponent = TearOutIcon,
    href,
    className,
    children,
    variant = "primary",
    color = "primary",
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

  return (
    <Text
      as="a"
      className={clsx(withBaseName(), className)}
      href={href}
      ref={ref}
      target={target}
      variant={variant}
      color={color}
      {...rest}
    >
      {children}
      {target === "_blank" && (
        <>
          {IconComponent && (
            <IconComponent className={withBaseName("icon")} aria-hidden />
          )}
          <span className={withBaseName("externalLinkADA")}>External</span>
        </>
      )}
    </Text>
  );
});

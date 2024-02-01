import { ComponentType, forwardRef, ReactElement } from "react";
import { clsx } from "clsx";
import { IconProps, TearOutIcon } from "@salt-ds/icons";
import { makePrefixer } from "../utils";
import { Text, TextProps } from "../text";

import linkCss from "./Link.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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
    target = "_self",
    ...rest
  },
  ref
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

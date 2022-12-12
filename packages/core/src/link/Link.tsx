import {
  ComponentType,
  forwardRef,
  MouseEvent,
  ReactElement,
  useCallback,
} from "react";
import cx from "classnames";
import { IconProps, TearOutIcon } from "@jpmorganchase/uitk-icons";
import { makePrefixer } from "../utils";
import { Text, TextProps } from "../text";

import "./Link.css";

const withBaseName = makePrefixer("uitkLink");

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
  const stopPropagation = useCallback(
    (evt: MouseEvent<HTMLAnchorElement>) => evt.stopPropagation(),
    []
  );

  return (
    <Text
      as="a"
      className={cx(withBaseName(), className)}
      href={href}
      onClick={stopPropagation}
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

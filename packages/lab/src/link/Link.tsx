import { forwardRef, ReactNode, useCallback } from "react";
import cx from "classnames";
import { TearOutIcon } from "@jpmorganchase/uitk-icons";
import { Text, TextProps } from "@jpmorganchase/uitk-lab";

import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./Link.css";

const withBaseName = makePrefixer("uitkLink");

/**
 * Links are a fundamental navigation element. When clicked, they take the user to an entirely different page.
 *
 * @example
 * <LinkExample to="#link">Action</LinkExample>
 */

export interface LinkProps extends TextProps {
  /**
   * The content of the link.
   */
  children?: ReactNode;
  /**
   * The className(s) of the component
   */
  className?: string;
  /**
   * If `true`, the link will be disabled.
   */
  disabled?: boolean;
  /**
   * A string to indicate the link url
   */
  href?: string;
  /**
   * A string to indicate the link target
   * Creates an Icon to the right of link if '_blank'
   */
  target?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, className, disabled, children, target = "_self", ...rest },
  ref
) {
  const stopPropagation = useCallback((evt) => evt.stopPropagation(), []);
  return (
    <Text
      elementType="a"
      className={cx(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
        },
        className
      )}
      href={disabled ? undefined : href}
      onClick={stopPropagation}
      ref={ref}
      target={target}
      {...rest}
    >
      {children}
      {target && target === "_blank" && (
        <TearOutIcon
          aria-label="External Link"
          className={withBaseName("icon")}
        />
      )}
    </Text>
  );
});

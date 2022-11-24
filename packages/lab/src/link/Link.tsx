import { forwardRef, useCallback, MouseEvent } from "react";
import cx from "classnames";
import { TearOutIcon } from "@jpmorganchase/uitk-icons";
import { makePrefixer, Text, TextProps } from "@jpmorganchase/uitk-core";

import "./Link.css";

const withBaseName = makePrefixer("uitkLink");

/**
 * Links are a fundamental navigation element. When clicked, they take the user to an entirely different page.
 *
 * @example
 * <LinkExample to="#link">Action</LinkExample>
 */

export interface LinkProps extends TextProps<"a"> {
  /**
   * If `true`, the link will be disabled.
   */
  disabled?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, className, disabled, children, target = "_self", ...rest },
  ref
) {
  const stopPropagation = useCallback(
    (evt: MouseEvent<HTMLAnchorElement>) => evt.stopPropagation(),
    []
  );
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
      tabIndex={disabled ? -1 : 0}
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

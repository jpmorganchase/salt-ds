import { forwardRef, useCallback, MouseEvent } from "react";
import cx from "classnames";
import { TearOutIcon } from "@jpmorganchase/uitk-icons";
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

export type LinkProps = TextProps<"a">;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, className, children, target = "_self", ...rest },
  ref
) {
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

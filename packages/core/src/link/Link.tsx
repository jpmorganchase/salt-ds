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
export interface LinkProps extends TextProps<"a"> {
  target?: "_blank";
  /**
   * Override "tearout" icon.
   */
  IconComponent?: ComponentType<IconProps>;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    IconComponent = TearOutIcon,
    href,
    className,
    children,
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
      tabIndex={0}
      target={target}
      {...rest}
    >
      {children}
      {target && target === "_blank" && (
        <IconComponent
          aria-label="External Link"
          className={withBaseName("icon")}
        />
      )}
    </Text>
  );
});

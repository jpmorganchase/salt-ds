import {
  cloneElement,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  ReactText,
} from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { MessageIcon } from "@jpmorganchase/uitk-icons";

import "./Badge.css";
import { useId } from "../utils";

/**
 * @example overriding density prop to fit a smaller denser space otherwise handled through context provider
 * <Badge density={'high'} />
 *
 * NOTE: Badge component no longer has AccessibleText prop
 *
 */

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The number to display on the badge.
   */
  badgeContent?: string | number;
  /**
   * The badge will be added relative to this node. Renders the "message" icon by default.
   */
  children?: ReactElement<HTMLAttributes<HTMLElement>> | ReactText;
  /**
   * The className(s) of the component.
   */
  className?: string;
  /**
   * The max number to display on the badge.
   */
  max?: number;
}

const withBaseName = makePrefixer("uitkBadge");

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    badgeContent = 0,
    max = 1000,
    className,
    children = <MessageIcon size={12} />,
    ...rest
  },
  ref
) {
  const badgeId = useId();
  const childId = useId(
    isValidElement<HTMLAttributes<HTMLElement>>(children)
      ? children.props?.id
      : undefined
  );

  let badgeContentValue = badgeContent;
  if (badgeContentValue > max) {
    badgeContentValue = `${max}+`;
  }

  return (
    <span
      className={cx(withBaseName(), className)}
      ref={ref}
      role="img"
      aria-labelledby={cx(childId, badgeId)}
      {...rest}
    >
      {children && isValidElement<HTMLAttributes<HTMLElement>>(children)
        ? cloneElement(children, { id: childId })
        : children}
      <span id={badgeId} className={cx(withBaseName("badge"))}>
        {badgeContentValue}
      </span>
    </span>
  );
});

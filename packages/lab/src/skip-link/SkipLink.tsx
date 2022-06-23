import { ForwardedRef, forwardRef, RefObject } from "react";
import { Link, LinkProps } from "../link";
import "./SkipLink.css";
import cx from "classnames";
import { useManageFocusOnTarget } from "./internal/useManageFocusOnTarget";

interface SkipLinkProps extends LinkProps {
  /**
   * This is a ref that has access to the target element.
   *
   * This will be used to apply focus to that element
   */
  targetRef?: RefObject<HTMLElement>;
}

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink(
    { className, targetRef, ...rest },
    ref: ForwardedRef<HTMLAnchorElement>
  ) {
    const clxPrefix = "uitk";

    const targetClass = cx(className, clxPrefix + "SkipLink-target");

    const eventHandlers = useManageFocusOnTarget({ targetRef, targetClass });

    return (
      <Link
        {...eventHandlers}
        {...rest}
        className={cx(className, clxPrefix + "SkipLink")}
        ref={ref}
      />
    );
  }
);

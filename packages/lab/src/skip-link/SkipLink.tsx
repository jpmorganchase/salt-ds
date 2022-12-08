import { forwardRef, RefObject } from "react";
import {
  InternalLinkProps,
  Link,
  makePrefixer,
} from "@jpmorganchase/uitk-core";
import "./SkipLink.css";
import cx from "classnames";
import { useManageFocusOnTarget } from "./internal/useManageFocusOnTarget";

interface SkipLinkProps extends InternalLinkProps {
  /**
   * This is a ref that has access to the target element.
   *
   * This will be used to apply focus to that element
   *
   * Refs are referentially stable so if this changes it won't be picked up
   * will need to find a better way of passing in the target element to apply the attributes
   */
  targetRef?: RefObject<HTMLElement>;
}

const withBaseName = makePrefixer("uitkSkipLink");

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink({ className, targetRef, ...rest }, ref) {
    const targetClass = cx(withBaseName("target"), className);

    const eventHandlers = useManageFocusOnTarget({ targetRef, targetClass });

    return (
      <li>
        <Link
          {...eventHandlers}
          {...rest}
          className={cx(withBaseName(), className)}
          ref={ref}
        />
      </li>
    );
  }
);

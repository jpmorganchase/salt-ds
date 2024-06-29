import { Link, type LinkProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type RefObject, forwardRef } from "react";
import { useManageFocusOnTarget } from "./internal/useManageFocusOnTarget";

import skipLinkCss from "./SkipLink.css";

interface SkipLinkProps extends LinkProps {
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

const withBaseName = makePrefixer("saltSkipLink");

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink({ className, targetRef, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-skip-link",
      css: skipLinkCss,
      window: targetWindow,
    });

    const targetClass = clsx(withBaseName("target"), className);

    const eventHandlers = useManageFocusOnTarget({ targetRef, targetClass });

    return (
      <li>
        <Link
          {...eventHandlers}
          {...rest}
          className={clsx(withBaseName(), className)}
          ref={ref}
        />
      </li>
    );
  },
);

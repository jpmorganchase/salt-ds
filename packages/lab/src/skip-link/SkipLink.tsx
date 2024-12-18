import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useManageFocusOnTarget } from "./internal/useManageFocusOnTarget";

import skipLinkCss from "./SkipLink.css";

interface SkipLinkProps extends ComponentPropsWithoutRef<"a"> {
  /**
   * The ID of the target element to apply focus when the link is clicked.
   * If the element with this ID is not found, the SkipLink will not be rendered.
   */
  target: string;
}

const withBaseName = makePrefixer("saltSkipLink");

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink({ className, target, children, ...rest }, ref) {
    const [isTargetAvailable, setIsTargetAvailable] = useState(false);
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-skip-link",
      css: skipLinkCss,
      window: targetWindow,
    });

    const targetRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      targetRef.current = document.getElementById(target);
      setIsTargetAvailable(!!targetRef.current);
    }, [target]);

    const eventHandlers = useManageFocusOnTarget({
      targetRef,
      targetClass: withBaseName("target"),
    });

    if (!isTargetAvailable) return null;
    return (
      <a
        className={clsx(withBaseName(), className)}
        href={`#${target}`}
        ref={ref}
        target="_self"
        {...eventHandlers}
        {...rest}
      >
        {children}
      </a>
    );
  },
);

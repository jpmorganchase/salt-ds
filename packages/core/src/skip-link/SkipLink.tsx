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
import { makePrefixer } from "../utils";
import { useManageFocusOnTarget } from "./internal/useManageFocusOnTarget";
import skipLinkCss from "./SkipLink.css";

interface SkipLinkProps extends ComponentPropsWithoutRef<"a"> {
  /**
   * The ID of the target element to apply focus when the link is clicked.
   * If the element with this ID is not found, the SkipLink will not be rendered.
   */
  targetId: string;
}

const withBaseName = makePrefixer("saltSkipLink");

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink(
    { className, targetId, children, onKeyUp, onBlur, onClick, ...rest },
    ref,
  ) {
    const [isTargetAvailable, setIsTargetAvailable] = useState(false);
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-skip-link",
      css: skipLinkCss,
      window: targetWindow,
    });

    const targetRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (targetWindow) {
        targetRef.current = targetWindow.document.getElementById(targetId);
      }
      setIsTargetAvailable(!!targetRef.current);
    }, [targetId, targetWindow]);

    const eventHandlers = useManageFocusOnTarget({
      onKeyUp,
      onBlur,
      onClick,
      targetRef,
      targetClass: withBaseName("target"),
    });

    if (!isTargetAvailable) return null;
    return (
      <a
        className={clsx(withBaseName(), className)}
        href={`#${targetId}`}
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

import {
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

const FOCUS_TIMEOUT = 50;

// Props interface
interface ManageFocusOnTargetProps {
  onBlur?: FocusEventHandler;
  onClick?: MouseEventHandler;
  onKeyUp?: KeyboardEventHandler;
  targetRef: RefObject<HTMLElement> | undefined;
  targetClass: string;
}

// Result interface
interface ManageFocusOnTargetResult {
  onBlur?: FocusEventHandler<HTMLAnchorElement>;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  onKeyUp?: KeyboardEventHandler<HTMLAnchorElement>;
}
export const useManageFocusOnTarget = ({
  onKeyUp,
  onBlur,
  onClick,
  targetRef,
  targetClass,
}: ManageFocusOnTargetProps): ManageFocusOnTargetResult => {
  const [target, setTarget] = useState<HTMLElement>();

  const hasTabIndex = useRef<boolean | string>();
  const shouldRemoveTabIndex = useRef<boolean>();

  useEffect(() => {
    if (targetRef?.current) {
      setTarget(targetRef.current);
    }
  }, [targetRef]);

  if (!target) {
    return {};
  }

  const addTabIndex = () => {
    const tabIndex = target.getAttribute("tabIndex");
    hasTabIndex.current = tabIndex || tabIndex === "0";

    if (!hasTabIndex.current) {
      shouldRemoveTabIndex.current = true;
      target.setAttribute("tabIndex", "-1");
    }
  };

  const removeTabIndex = () => {
    if (!hasTabIndex.current && shouldRemoveTabIndex.current) {
      target.removeAttribute("tabIndex");
    }
  };

  const handleFocusOnTarget = () => {
    shouldRemoveTabIndex.current = false;
    target.classList.add(targetClass);
  };

  const handleBlurFromTarget = () => {
    shouldRemoveTabIndex.current = true;
    removeTabIndex();
    target.classList.remove(targetClass);
  };

  function moveToTarget() {
    addTabIndex();
    setTimeout(() => {
      target?.focus();
    }, FOCUS_TIMEOUT);

    target?.addEventListener("focus", handleFocusOnTarget, { once: true });
    target?.addEventListener("blur", handleBlurFromTarget, { once: true });
  }

  const handleKeyUp: KeyboardEventHandler<HTMLAnchorElement> = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      moveToTarget();
    }
    onKeyUp?.(event);
  };

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    moveToTarget();
    onClick?.(event);
  };

  const handleBlur: FocusEventHandler<HTMLAnchorElement> = (event) => {
    setTimeout(removeTabIndex, FOCUS_TIMEOUT);
    onBlur?.(event);
  };

  return {
    onBlur: handleBlur,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
  };
};

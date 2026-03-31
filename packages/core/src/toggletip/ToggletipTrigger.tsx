import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
} from "react";
import { makePrefixer, useForkRef, useId } from "../utils";
import { useToggletipContext } from "./ToggletipContext";
import toggletipTriggerCss from "./ToggletipTrigger.css";

export interface ToggletipTriggerProps
  extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltToggletipTrigger");

export const ToggletipTrigger = forwardRef<
  HTMLButtonElement,
  ToggletipTriggerProps
>(function ToggletipTrigger(props, ref) {
  const { children, className, id: idProp, onKeyDown, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toggletip-trigger",
    css: toggletipTriggerCss,
    window: targetWindow,
  });

  const {
    floatingContent,
    openState,
    setReference,
    getReferenceProps,
    setTriggerId,
  } = useToggletipContext();

  const handleRef = useForkRef<HTMLButtonElement>(setReference, ref);

  const id = useId(idProp);

  useEffect(() => {
    if (id) {
      setTriggerId?.(id);
    }
  }, [id, setTriggerId]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);

    if (
      !openState ||
      event.key !== "Tab" ||
      event.shiftKey ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    if (floatingContent) {
      // React 16 support: explicitly move focus back into the open panel.
      event.preventDefault();
      floatingContent.focus();
    }
  };

  return (
    <button
      type="button"
      {...getReferenceProps({
        ref: handleRef,
        className: clsx(withBaseName(), className),
        id,
        onKeyDown: handleKeyDown,
        ...rest,
      })}
    >
      {children}
    </button>
  );
});

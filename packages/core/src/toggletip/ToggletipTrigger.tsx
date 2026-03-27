import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
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
  const { children, className, id: idProp, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toggletip-trigger",
    css: toggletipTriggerCss,
    window: targetWindow,
  });

  const { setReference, getReferenceProps, setTriggerId } =
    useToggletipContext();

  const handleRef = useForkRef<HTMLButtonElement>(setReference, ref);

  const id = useId(idProp);

  useEffect(() => {
    if (id) {
      setTriggerId?.(id);
    }
  }, [id, setTriggerId]);

  return (
    <button
      type="button"
      {...getReferenceProps({
        ref: handleRef,
        className: clsx(withBaseName(), className),
        id,
        ...rest,
      })}
    >
      {children}
    </button>
  );
});

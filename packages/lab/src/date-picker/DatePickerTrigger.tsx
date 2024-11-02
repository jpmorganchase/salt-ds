import { makePrefixer, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type ReactNode } from "react";
import { type DateFrameworkType } from "../date-adapters";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerTrigger");

/**
 * Props for the DatePickerTrigger component.
 */
export interface DatePickerTriggerProps {
  className?: string;
  children?: ReactNode;
}

export const DatePickerTrigger = forwardRef<
  HTMLDivElement,
  DatePickerTriggerProps
>((props: DatePickerTriggerProps, ref: React.Ref<HTMLDivElement>) => {
  const { children, className, ...rest } = props;

  const {
    state: { open, floatingUIResult },
    helpers: { getReferenceProps, setOpen },
  } = useDatePickerOverlay();

  const inputRef = useForkRef<HTMLDivElement>(ref, floatingUIResult?.reference);

  return (
    <div
      className={clsx(withBaseName(), className)}
      ref={inputRef}
      {...getReferenceProps(rest)}
    >
      {children}
    </div>
  );
});

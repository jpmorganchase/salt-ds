import { makePrefixer, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type ReactNode } from "react";
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
    state: { floatingUIResult },
    helpers: { getReferenceProps },
  } = useDatePickerOverlay();

  const triggerRef = useForkRef<HTMLDivElement>(
    ref,
    floatingUIResult?.reference,
  );

  return (
    <div
      className={clsx(withBaseName(), className)}
      ref={triggerRef}
      {...getReferenceProps(rest)}
    >
      {children}
    </div>
  );
});

import {
  makePrefixer,
  useFloatingComponent,
  useForkRef,
  useFormFieldProps,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import datePickerOverlayCss from "./DatePickerOverlay.css";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerOverlay");

/**
 * Props for the DatePickerOverlay component.
 */
export interface DatePickerOverlayProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content to be rendered inside the overlay.
   */
  children: ReactNode;
}

export const DatePickerOverlay = forwardRef<
  HTMLDivElement,
  DatePickerOverlayProps
>(function DatePickerOverlay({ className, children, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-overlay",
    css: datePickerOverlayCss,
    window: targetWindow,
  });

  const { Component: FloatingComponent } = useFloatingComponent();

  const { a11yProps } = useFormFieldProps();

  const {
    state: { open, floatingUIResult },
    helpers: { getFloatingProps },
  } = useDatePickerOverlay();

  const floatingRef = useForkRef<HTMLDivElement>(
    ref,
    floatingUIResult?.floating,
  );

  return (
    <FloatingComponent
      className={clsx(withBaseName(), className)}
      open={open || false}
      role="modal"
      aria-modal="true"
      ref={floatingRef}
      focusManagerProps={
        floatingUIResult?.context
          ? {
              context: floatingUIResult.context,
              initialFocus: 4,
            }
          : undefined
      }
      {...(getFloatingProps
        ? getFloatingProps({
            ...a11yProps,
            ...rest,
          })
        : rest)}
    >
      {children}
    </FloatingComponent>
  );
});

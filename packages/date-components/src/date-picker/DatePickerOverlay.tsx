import {
  AriaAnnouncerProvider,
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
  forwardRef,
  type ReactNode,
} from "react";
import datePickerOverlayCss from "./DatePickerOverlay.css";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

export const DATE_PICKER_OVERLAY_ANNOUNCER_TARGET = "date-picker-overlay";

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
      role="dialog"
      aria-modal="true"
      ref={floatingRef}
      aria-label="date picker"
      {...(getFloatingProps
        ? getFloatingProps({
            ...a11yProps,
            ...rest,
          })
        : rest)}
    >
      <AriaAnnouncerProvider target={DATE_PICKER_OVERLAY_ANNOUNCER_TARGET}>
        {children}
      </AriaAnnouncerProvider>
    </FloatingComponent>
  );
});

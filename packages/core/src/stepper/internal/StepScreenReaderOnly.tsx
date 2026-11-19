import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface StepScreenReaderOnlyProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The text for screen readers, which is visually hidden. Screen readers read
   * it in place, or through an ID reference such as `aria-labelledby` when the
   * element is `aria-hidden`.
   */
  children?: ReactNode;
}

export function StepScreenReaderOnly({
  children,
  ...props
}: StepScreenReaderOnlyProps) {
  return (
    <div className="salt-visuallyHidden" {...props}>
      {children}
    </div>
  );
}

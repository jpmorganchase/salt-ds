import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface StepScreenReaderOnlyProps
  extends ComponentPropsWithoutRef<"div"> {
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

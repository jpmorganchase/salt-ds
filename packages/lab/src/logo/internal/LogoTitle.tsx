import { ComponentPropsWithoutRef, forwardRef } from "react";

export interface LogoTitleProps extends ComponentPropsWithoutRef<"span"> {
  label?: string;
  separatorClassname?: string;
}

export const LogoTitle = forwardRef<HTMLSpanElement, LogoTitleProps>(
  function LogoTitle({ label, separatorClassname, ...rest }, ref) {
    return label ? (
      <>
        <span className={separatorClassname} />
        <span ref={ref} {...rest}>
          <span>{label}</span>
        </span>
      </>
    ) : null;
  }
);

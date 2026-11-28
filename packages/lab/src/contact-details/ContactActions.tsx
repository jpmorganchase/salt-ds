import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("saltContactActions");

export interface ContactActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const ContactActions = forwardRef<HTMLDivElement, ContactActionsProps>(
  function ContactActions(props, ref) {
    const { children, className, ...restProps } = props;
    const { variant } = useContactDetailsContext();
    if (variant === "mini") {
      return null;
    }
    return (
      <div {...restProps} ref={ref} className={clsx(withBaseName(), className)}>
        {children}
      </div>
    );
  },
);

import { makePrefixer } from "@salt-ds/core";
import { forwardRef, type HTMLAttributes } from "react";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("saltContactActions");

export interface ContactActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const ContactActions = forwardRef<HTMLDivElement, ContactActionsProps>(
  (props, ref) => {
    const { children, ...restProps } = props;
    const { variant } = useContactDetailsContext();
    if (variant === "mini") {
      return null;
    }
    return (
      <div {...restProps} ref={ref} className={withBaseName()}>
        {children}
      </div>
    );
  },
);

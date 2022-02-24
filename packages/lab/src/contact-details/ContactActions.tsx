import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@brandname/core";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("uitkContactActions");

export interface ContactActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const ContactActions = forwardRef<HTMLDivElement, ContactActionsProps>(
  function (props, ref) {
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
  }
);

import { makePrefixer } from "@salt-ds/core";
import { forwardRef, type HTMLAttributes } from "react";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("saltContactActions");

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export interface ContactActionsProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactActions = forwardRef<HTMLDivElement, ContactActionsProps>(
  function ContactActions(props, ref) {
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

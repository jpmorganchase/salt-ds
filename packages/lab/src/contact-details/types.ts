import type { HTMLAttributes } from "react";

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export interface ValueComponentProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  value?: string;
}

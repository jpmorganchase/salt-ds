import { Link, Text } from "@salt-ds/core";

import { isEmail } from "../utils";
import type { ValueComponentProps } from "./types";

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const MailLinkComponent = (props: ValueComponentProps) => {
  const { value, ...restProps } = props;

  return isEmail(value) ? (
    <Link href={`mailto:${value}`} tabIndex={0} maxRows={1} {...restProps}>
      {value}
    </Link>
  ) : (
    <Text maxRows={1}>{value}</Text>
  );
};

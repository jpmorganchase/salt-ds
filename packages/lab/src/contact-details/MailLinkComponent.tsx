import { forwardRef } from "react";
import { Link } from "../link";
import { ValueComponentProps } from "./internal";

export const MailLinkComponent = forwardRef<
  HTMLAnchorElement,
  ValueComponentProps
>(function MailLinkComponent(props, ref) {
  const { value, ...restProps } = props;
  return (
    <Link ref={ref} href={`mailto:${value}`} tabIndex={0} {...restProps}>
      {value}
    </Link>
  );
});

import { forwardRef, FC } from "react";
import { Link } from "../link";
import { Div } from "../typography";
import { ValueComponentProps } from "./internal";

export const MailLinkComponent: FC<ValueComponentProps> = (props) => {
  const { value, ...restProps } = props;

  function isEmail(value?: string): boolean {
    return !!value && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
  }

  return isEmail(value) ? (
    <Link href={`mailto:${value}`} tabIndex={0} {...restProps}>
      {value}
    </Link>
  ) : (
    <Div truncate maxRows={1}>
      {value}
    </Div>
  );
};

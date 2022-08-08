import { FC } from "react";
import { Link } from "../link";
import { Div } from "../typography";
import { ValueComponentProps } from "./internal";
import { isEmail } from "../utils";

export const MailLinkComponent: FC<ValueComponentProps> = (props) => {
  const { value, ...restProps } = props;

  return isEmail(value) ? (
    <Link
      href={`mailto:${value}`}
      tabIndex={0}
      truncate
      maxRows={1}
      {...restProps}
    >
      {value}
    </Link>
  ) : (
    <Div truncate maxRows={1}>
      {value}
    </Div>
  );
};

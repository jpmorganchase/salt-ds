import { Link } from "../link";
import { Div } from "../text";
import { isEmail } from "../utils";
import { ValueComponentProps } from "./types";

export const MailLinkComponent = (props: ValueComponentProps) => {
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

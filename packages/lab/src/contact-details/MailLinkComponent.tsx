import { Link } from "../link";
import { Text } from "../text";
import { isEmail } from "../utils";
import { ValueComponentProps } from "./types";

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

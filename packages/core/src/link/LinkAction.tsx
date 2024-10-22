import type { ComponentPropsWithoutRef } from "react";
import { Text } from "../text";
import { renderProps } from "../utils";

interface LinkActionProps extends ComponentPropsWithoutRef<any> {}

export function LinkAction(props: LinkActionProps) {
  const { render, ...rest } = props;

  if (render) {
    return renderProps("a", props);
  }

  return <Text {...rest} />;
}

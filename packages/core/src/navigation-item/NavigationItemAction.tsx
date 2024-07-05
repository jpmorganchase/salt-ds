import { ComponentPropsWithoutRef } from "react";
import { renderProps } from "../utils";

interface NavigationItemActionProps extends ComponentPropsWithoutRef<any> {}

export function NavigationItemAction(props: NavigationItemActionProps) {
  return renderProps("a", props);
}

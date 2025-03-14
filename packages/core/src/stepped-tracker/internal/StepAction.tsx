import type { ComponentPropsWithoutRef } from "react";
import { renderProps } from "../../utils";

interface StepActionProps extends ComponentPropsWithoutRef<any> {}

export function StepAction(props: StepActionProps) {
  return renderProps("div", props);
}

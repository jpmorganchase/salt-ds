import { Button, type ButtonProps } from "@salt-ds/core";
import { forwardRef } from "react";

/** Transparent fixture wrapper; it adds no analytics or product defaults. */
export const AppButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function AppButton(props, ref) {
    return <Button ref={ref} {...props} />;
  },
);

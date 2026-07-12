import { Button, type ButtonProps } from "@salt-ds/core";
import { forwardRef } from "react";

/** Repo-owned action wrapper declared by `.salt/team.json`. */
export const AppButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function AppButton(props, ref) {
    return <Button ref={ref} {...props} />;
  },
);

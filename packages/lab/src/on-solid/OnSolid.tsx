import { Button, type ButtonProps } from "@salt-ds/core";
import { forwardRef } from "react";

export interface OnSolidProps extends ButtonProps {}

export const OnSolid = forwardRef<HTMLButtonElement, OnSolidProps>(
  function OnSolid(props, ref) {
    return <Button ref={ref} {...props} />;
  },
);


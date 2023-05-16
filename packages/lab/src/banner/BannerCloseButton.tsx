import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { clsx } from "clsx";

export const BannerCloseButton = (props: ButtonProps) => (
  <Button {...props} variant="secondary">
    <CloseIcon />
  </Button>
);

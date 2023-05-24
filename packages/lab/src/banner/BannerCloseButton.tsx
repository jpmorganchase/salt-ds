import { Button, ButtonProps } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const BannerCloseButton = (props: ButtonProps) => (
  <Button {...props} variant="secondary">
    <CloseIcon />
  </Button>
);

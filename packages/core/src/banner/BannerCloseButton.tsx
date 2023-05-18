import { Button, ButtonProps } from "../button";
import { CloseIcon } from "@salt-ds/icons";

export const BannerCloseButton = (props: ButtonProps) => (
  <Button {...props} variant="secondary">
    <CloseIcon />
  </Button>
);

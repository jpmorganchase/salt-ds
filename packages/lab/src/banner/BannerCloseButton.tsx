import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

import "./BannerCloseButton.css";

const withBaseName = makePrefixer("saltBannerCloseButton");

export const BannerCloseButton = (props: ButtonProps) => (
  <Button {...props} className={withBaseName()} variant="secondary">
    <CloseIcon />
  </Button>
);

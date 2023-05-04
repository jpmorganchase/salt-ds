import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

import "./BannerCloseButton.css";

const withBaseName = makePrefixer("saltBannerClose");

export const BannerCloseButton = (props: ButtonProps) => (
  <Button
    {...props}
    aria-label="close"
    className={withBaseName()}
    variant="secondary"
  >
    <CloseIcon />
  </Button>
);

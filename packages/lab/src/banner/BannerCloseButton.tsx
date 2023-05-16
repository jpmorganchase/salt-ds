import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { clsx } from "clsx";

const withBaseName = makePrefixer("saltBannerCloseButton");

export const BannerCloseButton = ({ className, ...restProps }: ButtonProps) => (
  <Button
    {...restProps}
    className={clsx(withBaseName(), className)}
    variant="secondary"
  >
    <CloseIcon />
  </Button>
);

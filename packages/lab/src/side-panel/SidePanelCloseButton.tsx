import {
  Button,
  type ButtonProps,
  makePrefixer,
  useIcon,
  useId,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type MouseEvent } from "react";
import { useSidePanelContext } from "./internal";

const withBaseName = makePrefixer("saltSidePanelCloseButton");

export const SidePanelCloseButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function SidePanelCloseButton({ className, onClick, ...rest }, ref) {
    const { CloseIcon } = useIcon();
    const { setOpen, titleId } = useSidePanelContext();
    const closeButtonId = useId();

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      setOpen(false);
    };

    return (
      <Button
        ref={ref}
        id={closeButtonId}
        aria-label="Close"
        aria-labelledby={clsx(closeButtonId, titleId) || undefined}
        appearance="transparent"
        className={clsx(withBaseName(), className)}
        onClick={handleClick}
        {...rest}
      >
        <CloseIcon aria-hidden />
      </Button>
    );
  },
);

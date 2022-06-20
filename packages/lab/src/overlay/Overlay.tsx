import {
  Button,
  makePrefixer,
  Portal,
  UseFloatingUIProps,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { CloseIcon } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import { ComponentProps, ComponentPropsWithoutRef, forwardRef } from "react";
import { useId } from "../utils";

import "./Overlay.css";

interface ADAExceptions {
  showClose?: boolean;
}

export interface OverlayProps
  extends ComponentPropsWithoutRef<"div">,
    Partial<Pick<UseFloatingUIProps, "onOpenChange" | "open">> {
  /**
   * object that houses ada related props.
   * adaExceptions.showClose defaults to true. It can be removed at the risk of ADA compliance
   */
  adaExceptions?: ADAExceptions;
  arrowProps?: ComponentProps<"div">;
}

const withBaseName = makePrefixer("uitkOverlay");

export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  (
    {
      adaExceptions: { showClose } = {
        showClose: true,
      },
      arrowProps,
      children,
      className,
      open,
      onOpenChange,
      ...rest
    },
    ref
  ) => {
    // Will need to figure out a better way to assign popper id's for the electron windows
    const id = useId();
    const Window = useWindow();

    const handleCloseButton = () => {
      onOpenChange?.(false);
    };

    if (!open) {
      return null;
    }

    return (
      <Portal>
        <Window
          className={cx(withBaseName(), className)}
          id={id}
          ref={ref}
          {...rest}
        >
          <div
            className={cx(withBaseName("content"))}
            data-testid="overlay-content"
          >
            {showClose && (
              <Button
                onClick={handleCloseButton}
                className={withBaseName("close")}
                variant="secondary"
              >
                <CloseIcon
                  accessible-text="close overlay"
                  className={withBaseName("closeIcon")}
                  size={12}
                />
              </Button>
            )}
            {children}
            <div className={withBaseName("arrow")} {...arrowProps} />
          </div>
        </Window>
      </Portal>
    );
  }
);

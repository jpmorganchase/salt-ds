import { Button, makePrefixer, Portal, useId } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { ComponentProps, ComponentPropsWithoutRef, forwardRef } from "react";
import { useWindow } from "../window";
import { UseFloatingUIProps } from "../popper";

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
  variant?: "primary" | "secondary";
}

const withBaseName = makePrefixer("saltOverlay");

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
      variant = "primary",
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
          className={clsx(withBaseName(), className, {
            [withBaseName(variant)]: variant === "secondary",
          })}
          id={id}
          ref={ref}
          {...rest}
        >
          <div
            className={clsx(withBaseName("content"))}
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

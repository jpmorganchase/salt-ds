import cx from "classnames";
import { forwardRef, SyntheticEvent } from "react";
import { makePrefixer, Button } from "@brandname/core";
import { CloseIcon } from "@brandname/icons";
import { FocusManager } from "../focus-manager";
import { Popper, PopperProps } from "../popper";
import { useClickOutside, useForkRef, useId } from "../utils";

import "./Overlay.css";

interface ADAExceptions {
  showClose?: boolean;
}

export interface OverlayProps extends PopperProps {
  /**
   * object that houses ada related props.
   * adaExceptions.showClose defaults to true. It can be removed at the risk of ADA compliance
   *
   */
  adaExceptions?: ADAExceptions;
  /**
   * The className(s) of the component.
   */
  className?: string;
  /**
   * Callback fired when a click event is detected outside the Overlay.
   */
  onBackdropClick?: () => void;
  /**
   * @param {object} event The event source of the callback.
   * Callback fired when the component requests to be closed.
   */
  onClose?: (event: SyntheticEvent) => void;
  /**
   *  If true, the Overlay is visible.
   */
  open?: boolean;
}

const withBaseName = makePrefixer("uitkOverlay");

export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  (
    {
      adaExceptions: { showClose } = {
        showClose: true,
      },
      anchorEl,
      children,
      className,
      open = false,
      onBackdropClick,
      onClose,
      placement = "right",
      ...rest
    },
    ref
  ) => {
    const handleClickOutside = () => {
      onBackdropClick?.();
    };

    const clickOutsideRef = useClickOutside<HTMLDivElement>(handleClickOutside);
    const handleRef = useForkRef(clickOutsideRef, ref);

    // Will need to figure out a better way to assign popper id's for the electron windows
    const id = useId();

    return (
      <Popper
        anchorEl={anchorEl}
        className={cx(className, withBaseName())}
        open={open}
        placement={placement}
        data-testid="overlay"
        id={id}
        role="dialog"
        ref={handleRef}
        {...rest}
      >
        <FocusManager active>
          <div
            className={cx(withBaseName("content"), withBaseName(placement))}
            data-testid="overlay-content"
          >
            {showClose && (
              <Button
                onClick={onClose}
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
          </div>
        </FocusManager>
      </Popper>
    );
  }
);

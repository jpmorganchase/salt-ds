import cx from "classnames";
import { ComponentPropsWithoutRef, forwardRef, SyntheticEvent } from "react";
import { VirtualElement } from "@floating-ui/core";
import {
  makePrefixer,
  Button,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import { CloseIcon } from "@jpmorganchase/icons";
import { FocusManager } from "../focus-manager";
import { useFloatingUI, UseFloatingUIProps } from "../popper";
import { useClickOutside, useForkRef, useId } from "../utils";

import "./Overlay.css";
import { useWindow } from "../window";
import { Portal } from "../portal";

interface ADAExceptions {
  showClose?: boolean;
}

export interface OverlayProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * object that houses ada related props.
   * adaExceptions.showClose defaults to true. It can be removed at the risk of ADA compliance
   *
   */
  adaExceptions?: ADAExceptions;
  /**
   * A HTML element or a virtual element
   */
  anchorEl?: Element | VirtualElement | null;
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
  /**
   * Overlay placement
   */
  placement?: UseFloatingUIProps["placement"];
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
      style,
      ...rest
    },
    ref
  ) => {
    const handleClickOutside = () => {
      onBackdropClick?.();
    };

    const clickOutsideRef = useClickOutside<HTMLDivElement>(handleClickOutside);
    const handleClickOutsideRef = useForkRef(clickOutsideRef, ref);

    // Will need to figure out a better way to assign popper id's for the electron windows
    const id = useId();
    const Window = useWindow();
    const { reference, floating, x, y, strategy } = useFloatingUI({
      placement,
    });
    useIsomorphicLayoutEffect(() => {
      if (anchorEl) {
        reference(anchorEl);
      }
    }, [reference, anchorEl]);
    const handleRef = useForkRef<HTMLDivElement>(
      floating,
      handleClickOutsideRef
    );

    if (!open) {
      return null;
    }

    return (
      <Portal>
        <Window
          className={cx(className, withBaseName())}
          data-testid="overlay"
          id={id}
          role="dialog"
          ref={handleRef}
          style={{
            top: y ?? "",
            left: x ?? "",
            position: strategy,
            ...style,
          }}
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
        </Window>
      </Portal>
    );
  }
);

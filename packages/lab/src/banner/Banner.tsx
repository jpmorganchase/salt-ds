import {
  ComponentType,
  forwardRef,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  useEffect,
  useState,
  Ref,
} from "react";
import {
  Button,
  ButtonProps,
  Link,
  LinkProps,
  makePrefixer,
  StatusIndicator,
  useAriaAnnouncer,
  useForkRef,
  ValidationStatus,
} from "@salt-ds/core";

import getInnerText from "./internal/getInnerText";
import { CloseIcon, IconProps } from "@salt-ds/icons";
import { clsx } from "clsx";

import "./Banner.css";

export type BannerStatus = ValidationStatus;

export type LabelProps = { className?: string };

type StateAndPropsGetterFunction<TInjectedProps> = <T>(
  props?: T
) => TInjectedProps;

export interface GetStateAndPropGetters {
  Icon: ComponentType<IconProps>;
  getIconProps: StateAndPropsGetterFunction<IconProps>;
  getLabelProps: StateAndPropsGetterFunction<LabelProps>;
  getLinkProps: StateAndPropsGetterFunction<LinkProps>;
}

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Announcement message for screen reader 250ms after the banner is mounted.
   */
  announcement?: string;
  /**
   * THe props to be passed to the close button
   */
  CloseButtonProps?: ButtonProps;
  /**
   * close button ref
   */
  closeRef?: Ref<HTMLButtonElement>;
  /**
   * If true, the built-in ARIA announcer will be disabled
   */
  disableAnnouncer?: boolean;
  /**
   * Emphasize the styling by applying a background color: defaults to false
   */
  emphasize?: boolean;
  /**
   * onClose callback when the close icon is clicked, the dismiss button will not be rendered if this is
   * not defined
   */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   *  A string to determine the current state of the Banner
   */
  status?: BannerStatus;
}

const withBaseName = makePrefixer("saltBanner");

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    CloseButtonProps,
    announcement: announcementProp,
    children,
    className,
    closeRef,
    disableAnnouncer = false,
    emphasize = false,
    onClose,
    status = "info",
    ...rest
  },
  ref
) {
  const { announce } = useAriaAnnouncer();

  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
    null
  );

  const handleRef = useForkRef<HTMLDivElement>(setContainerNode, ref);

  useEffect(() => {
    if (!disableAnnouncer && containerNode) {
      const announcement = announcementProp || getInnerText(containerNode);
      announce(announcement, 250);
    }
  }, [announce, disableAnnouncer, containerNode, announcementProp]);

  const [open, setOpen] = useState(true);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setOpen(false);
    onClose?.(event);
  };

  return (
    <>
      {open && (
        <div
          className={clsx(withBaseName(), withBaseName(status), className, {
            [withBaseName("emphasize")]: emphasize,
          })}
          ref={handleRef}
          {...rest}
        >
          <StatusIndicator
            className={clsx(withBaseName("icon"), className)}
            status={status}
          />
          <span className={clsx(withBaseName("content"), className)}>
            {children}
          </span>
          {onClose && (
            <Button
              aria-label="close"
              {...CloseButtonProps}
              className={withBaseName("closeButton")}
              onClick={handleClick}
              ref={closeRef}
              variant="secondary"
            >
              <CloseIcon />
            </Button>
          )}
        </div>
      )}
    </>
  );
});

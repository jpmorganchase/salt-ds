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
   * THe props to be passed to the close button
   */
  CloseButtonProps?: ButtonProps;
  /**
   * Props to pass to Link, Link will not be rendered if this is undefined
   */
  LinkProps?: LinkProps;
  /**
   * Announcement message for screen reader 250ms after the banner is mounted.
   */
  announcement?: string;
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
   * render props callback (if children callback not supplied)
   */
  render?: (props: GetStateAndPropGetters) => ReactNode;
  /**
   *  A string to determine the current state of the Banner
   */
  status?: BannerStatus;
}

const withBaseName = makePrefixer("saltBanner");

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    CloseButtonProps,
    LinkProps,
    announcement: announcementProp,
    children,
    className,
    closeRef,
    disableAnnouncer = false,
    emphasize = false,
    onClose,
    render,
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

  const getIconProps = ({ className, ...restProps }: IconProps = {}) => {
    return {
      className: clsx(withBaseName("icon"), status, className),
      ...restProps,
    };
  };

  const getLabelProps = ({ className, ...restProps }: LabelProps = {}) => ({
    className: clsx(withBaseName("label"), status, className),
    ...restProps,
  });

  const getLinkProps = ({ className, href, ...restProps }: LinkProps = {}) => ({
    children: "Link",
    className: clsx(withBaseName("link"), status, className),
    href,
    ...restProps,
  });

  const getStateAndPropsGetters = (): GetStateAndPropGetters => ({
    Icon: (props) => <StatusIndicator {...props} status={status} />,
    getIconProps,
    getLabelProps,
    getLinkProps,
  });

  let contentElement;
  if (!render) {
    contentElement = (
      <>
        <StatusIndicator {...getIconProps()} status={status}></StatusIndicator>
        <span {...getLabelProps()}>
          {children} {LinkProps && <Link {...getLinkProps(LinkProps)} />}
        </span>
      </>
    );
  } else {
    contentElement = render(getStateAndPropsGetters());
  }

  return (
    <div
      className={clsx(withBaseName(), withBaseName(status), className, {
        [withBaseName("emphasize")]: emphasize,
      })}
      ref={handleRef}
      {...rest}
    >
      {contentElement}
      {onClose && (
        <Button
          aria-label="close"
          {...CloseButtonProps}
          className={withBaseName("closeButton")}
          onClick={onClose}
          ref={closeRef}
          variant="secondary"
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  );
});

import {
  ComponentType,
  forwardRef,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Button,
  ButtonProps,
  makePrefixer,
  StatusIcon,
  useAriaAnnouncer,
  useForkRef,
} from "@jpmorganchase/uitk-core";

import { Link, LinkProps } from "../link";
import getInnerText from "./internal/getInnerText";
import { CloseIcon, IconProps } from "@jpmorganchase/uitk-icons";
import cx from "classnames";

import "./Banner.css";

export type BannerStatus = "error" | "info" | "success" | "warning";

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
  closeRef?: (ref: ReactNode) => ReactNode;
  /**
   * If true, the built-in ARIA announcer will be disabled
   */
  disableAnnouncer?: boolean;
  /**
   * Emphasis styling variant; defaults to "medium".
   */
  emphasis?: "medium" | "high";
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

const withBaseName = makePrefixer("uitkBanner");

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    CloseButtonProps,
    LinkProps,
    announcement: announcementProp,
    children,
    className,
    closeRef,
    disableAnnouncer = false,
    emphasis = "medium",
    onClose,
    render,
    status = "info",
    ...rest
  },
  ref
) {
  const { announce } = useAriaAnnouncer();

  const [containerNode, setContainerNode] = useState();

  const setContainerRef = useCallback((node) => {
    if (node) {
      setContainerNode(node);
    }
  }, []);

  const handleRef = useForkRef<HTMLDivElement>(setContainerRef, ref);

  useEffect(() => {
    if (!disableAnnouncer && containerNode) {
      const announcement = announcementProp || getInnerText(containerNode);
      announce(announcement, 250);
    }
  }, [announce, disableAnnouncer, containerNode, announcementProp]);

  const getIconProps = ({ className, ...restProps }: IconProps = {}) => {
    return {
      className: cx(withBaseName("icon"), status, className),
      ...restProps,
    };
  };

  const getLabelProps = ({ className, ...restProps }: LabelProps = {}) => ({
    className: cx(withBaseName("label"), status, className),
    ...restProps,
  });

  const getLinkProps = ({ className, href, ...restProps }: LinkProps = {}) => ({
    children: "Link",
    className: cx(withBaseName("link"), status, className),
    href,
    ...restProps,
  });

  const getStateAndPropsGetters = (): GetStateAndPropGetters => ({
    Icon: (props) => <StatusIcon {...props} status={status} />,
    getIconProps,
    getLabelProps,
    getLinkProps,
  });

  let contentElement;
  if (!render) {
    contentElement = (
      <>
        <StatusIcon {...getIconProps()} status={status}></StatusIcon>
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
      className={cx(withBaseName(), withBaseName(status), className, {
        uitkEmphasisHigh: emphasis === "high",
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

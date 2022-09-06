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
  Density,
  makePrefixer,
  useAriaAnnouncer,
  useForkRef,
} from "@jpmorganchase/uitk-core";

import { Link, LinkProps } from "../link";
import getInnerText from "./internal/getInnerText";
import { CloseIcon, IconProps } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import { getIconForState } from "./internal/getIconForState";

import "./Banner.css";

export type State = "error" | "info" | "success" | "warning";

export type LabelProps = { className?: string };

type StateAndPropsGetterFunction<TInjectedProps> = (
  props?: TInjectedProps
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
   * Props to pass to Link
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
   * Determines the density of the component, Myst be one of: 'low', 'medium', 'high' or 'touch'
   */
  density?: Density;
  /**
   * If true, the built-in ARIA announcer will be disabled
   */
  disableAnnouncer?: boolean;
  /**
   * onClose callback when the close icon is clicked
   */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * render props callback (if children callback not supplied)
   */
  render?: (props: GetStateAndPropGetters) => ReactNode;
  /**
   *  state
   */
  state?: State;
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
    onClose,
    render,
    state = "info",
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

  const getIconProps = ({ className, ...restProps }: IconProps = {}) => ({
    className: withBaseName("icon"),
    ...restProps,
  });

  const getLabelProps = ({ className, ...restProps }: LabelProps = {}) => ({
    className,
    ...restProps,
  });

  const getLinkProps = ({ className, href, ...restProps }: LinkProps = {}) => ({
    children: "Link",
    className,
    href,
    ...restProps,
  });

  const getStateAndPropsGetters = (): GetStateAndPropGetters => ({
    Icon: getIconForState(state),
    getIconProps,
    getLabelProps,
    getLinkProps,
  });

  let contentElement;
  if (!render) {
    const StateIcon = getIconForState(state);
    contentElement = (
      <>
        {state ? <StateIcon {...getIconProps()} /> : null}
        <span {...getLabelProps()}>
          {children}
          {LinkProps && <Link {...getLinkProps(LinkProps)} />}
        </span>
      </>
    );
  } else {
    contentElement = render(getStateAndPropsGetters()) || null;
  }

  return (
    <div
      className={cx(withBaseName(), withBaseName(state), className)}
      ref={handleRef}
      {...rest}
    >
      {contentElement}
      {onClose && (
        <Button
          aria-label="close"
          {...CloseButtonProps}
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

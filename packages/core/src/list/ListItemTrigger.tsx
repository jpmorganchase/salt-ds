import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  type RefAttributes,
} from "react";
import { makePrefixer, type RenderPropsType, renderProps } from "../utils";
import listItemTriggerCss from "./ListItemTrigger.css";

export interface ListItemTriggerButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "href"> {
  /**
   * Omit `href` to render the primary action as a button.
   */
  href?: undefined;
  /**
   * Replace the underlying button while receiving its merged native props.
   */
  render?: RenderPropsType["render"];
}

export interface ListItemTriggerLinkProps
  extends Omit<ComponentPropsWithoutRef<"a">, "href"> {
  /**
   * Render the primary action as a link to this destination.
   */
  href: string;
  /**
   * Replace the underlying anchor while receiving its merged native props.
   */
  render?: RenderPropsType["render"];
}

export type ListItemTriggerProps =
  | ListItemTriggerButtonProps
  | ListItemTriggerLinkProps;

type ListItemTriggerButtonComponentProps = ListItemTriggerButtonProps &
  RefAttributes<HTMLButtonElement>;
type ListItemTriggerLinkComponentProps = ListItemTriggerLinkProps &
  RefAttributes<HTMLAnchorElement>;

interface ListItemTriggerComponent {
  (props: ListItemTriggerButtonComponentProps): ReactElement | null;
  (props: ListItemTriggerLinkComponentProps): ReactElement | null;
  (
    props:
      | ListItemTriggerButtonComponentProps
      | ListItemTriggerLinkComponentProps,
  ): ReactElement | null;
}

const withBaseName = makePrefixer("saltListItemTrigger");

function ListItemTriggerImpl(
  props: ListItemTriggerProps,
  ref: ForwardedRef<HTMLAnchorElement | HTMLButtonElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-list-item-trigger",
    css: listItemTriggerCss,
    window: targetWindow,
  });

  if (props.href !== undefined) {
    const { children, className, href, render, ...rest } = props;

    return renderProps("a", {
      ...rest,
      className: clsx(withBaseName(), className),
      href,
      ref: ref as ForwardedRef<HTMLAnchorElement>,
      render,
      children,
    });
  }

  const {
    children,
    className,
    href: _href,
    render,
    type = "button",
    ...rest
  } = props;

  return renderProps("button", {
    ...rest,
    className: clsx(withBaseName(), className),
    ref: ref as ForwardedRef<HTMLButtonElement>,
    render,
    type,
    children,
  });
}

/**
 * A native button or link that fills the primary region of a list row.
 */
export const ListItemTrigger = forwardRef(
  ListItemTriggerImpl,
) as ListItemTriggerComponent;

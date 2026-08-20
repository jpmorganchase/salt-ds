import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  type RefAttributes,
} from "react";
import { makePrefixer, type RenderPropsType, renderProps } from "../utils";
import listItemActionCss from "./ListItemAction.css";

export type ListItemActionButtonRenderProps = ComponentPropsWithRef<"button">;
export type ListItemActionLinkRenderProps = Omit<
  ComponentPropsWithRef<"a">,
  "href"
> & {
  href: string;
};

type ButtonRender =
  | ReactElement
  | ((props: ListItemActionButtonRenderProps) => ReactElement);
type LinkRender =
  | ReactElement
  | ((props: ListItemActionLinkRenderProps) => ReactElement);

export interface ListItemActionButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "href"> {
  /**
   * Omit `href` to render the primary action as a button.
   */
  href?: undefined;
  /**
   * Replace the underlying button while receiving its merged native props.
   */
  render?: ButtonRender;
}

export interface ListItemActionLinkProps
  extends Omit<ComponentPropsWithoutRef<"a">, "href"> {
  /**
   * Render the primary action as a link to this destination.
   */
  href: string;
  /**
   * Replace the underlying anchor while receiving its merged native props.
   */
  render?: LinkRender;
}

export type ListItemActionProps =
  | ListItemActionButtonProps
  | ListItemActionLinkProps;

type ListItemActionButtonComponentProps = ListItemActionButtonProps &
  RefAttributes<HTMLButtonElement>;
type ListItemActionLinkComponentProps = ListItemActionLinkProps &
  RefAttributes<HTMLAnchorElement>;

interface ListItemActionComponent {
  (props: ListItemActionButtonComponentProps): ReactElement | null;
  (props: ListItemActionLinkComponentProps): ReactElement | null;
  (
    props:
      | ListItemActionButtonComponentProps
      | ListItemActionLinkComponentProps,
  ): ReactElement | null;
}

const withBaseName = makePrefixer("saltCoreListItemAction");

function ListItemActionImpl(
  props: ListItemActionProps,
  ref: ForwardedRef<HTMLAnchorElement | HTMLButtonElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-core-list-item-action",
    css: listItemActionCss,
    window: targetWindow,
  });

  if (props.href !== undefined) {
    const { children, className, href, render, ...rest } = props;

    return renderProps("a", {
      ...rest,
      className: clsx(withBaseName(), className),
      href,
      ref: ref as ForwardedRef<HTMLAnchorElement>,
      render: render as RenderPropsType["render"],
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
    render: render as RenderPropsType["render"],
    type,
    children,
  });
}

/**
 * A native button or link that fills the primary region of a list row.
 */
export const ListItemAction = forwardRef(
  ListItemActionImpl,
) as ListItemActionComponent;

import {
  Button,
  ButtonProps,
  makePrefixer,
  useForkRef,
  useIsomorphicLayoutEffect,
  useTooltip,
  useTooltipContext,
} from "@jpmorganchase/uitk-core";
import cn from "classnames";
import {
  cloneElement,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  KeyboardEvent,
  MutableRefObject,
  ReactElement,
  ReactEventHandler,
  SyntheticEvent,
  useRef,
  useState,
} from "react";
import { pillBaseName } from "../constants";
import { DeleteButton } from "./DeleteButton";

import "../Pill.css";

const useEllipsisIsActive = (): [
  MutableRefObject<HTMLDivElement | null>,
  boolean
] => {
  const labelRef = useRef<HTMLDivElement | null>(null);
  const [showEllipsis, setShowEllipsis] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (labelRef.current) {
      setShowEllipsis(
        labelRef.current.offsetWidth < labelRef.current.scrollWidth
      );
    }
  }, []);
  return [labelRef, showEllipsis];
};

const noop = () => undefined;

const withBaseName = makePrefixer(pillBaseName);

export interface PillBaseProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Defines a human-readable, author-localized description for the role of an element.
   *
   * This should be in favour of aria-label for `Pill`
   **/
  "aria-roledescription"?: string;
  /**
   * Clickable variation. Use 'onClick' for callback.
   */
  clickable?: boolean;
  /**
   * Shows delete icon. Use `onDelete` for callback.
   */
  deletable?: boolean;
  /**
   * Override the default delete icon element. Shown only if `deletable` is set.
   */
  // TODO: Should this be DeleteIcon (caps)?
  deleteIcon?: ReactElement;
  /**
   * If `true`, the pill will be disabled.
   */
  disabled?: boolean;
  /**
   * Whether the pill is been highlighted.
   * If `true`, the pill will display Tooltip when text within is truncated.
   */
  highlighted?: boolean;
  /**
   * Icon element.
   */
  // TODO: Should this be Icon (caps)?
  icon?: ReactElement;
  /**
   * The content of the label.
   */
  label?: string;
  /**
   * Callback function fired when pill is clicked.
   */
  onClick?: (event: SyntheticEvent<HTMLDivElement>) => void;
  /**
   * Callback function fired when the delete icon is clicked. Used when `deletable` is true.
   */
  onDelete?: ReactEventHandler<HTMLElement>;
}

const DivButton = forwardRef<HTMLDivElement, ButtonProps<"div">>(
  function DivButton({ elementType = "div", ...props }, ref) {
    return <Button elementType={elementType} {...props} ref={ref} />;
  }
);

export const PillBase = forwardRef(function PillBase(
  {
    "aria-roledescription": ariaRoledescription = "Pill",
    label,
    className,
    // New API
    clickable,
    disabled,
    // TODO: Should this be a prop as we have variant: 'closable'
    // New API.
    deletable,
    deleteIcon: deleteIconProp,
    // TODO: Not implemented. Consider to add `useImperativeHandle` like API to Tooltip?
    highlighted,
    icon,
    onClick = noop,
    onDelete,
    onKeyDown = noop,
    onKeyUp = noop,
    ...rest
  }: PillBaseProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { Tooltip, enterDelay, leaveDelay, placement } = useTooltipContext();

  const [active, setActive] = useState(false);
  const [labelRef, ellipsis] = useEllipsisIsActive();
  const clickKeys = ["Enter", " "];

  const pillIcon =
    icon && isValidElement<any>(icon)
      ? cloneElement(icon, {
          ...icon.props,
          className: cn(withBaseName("icon"), icon.props.className),
        })
      : icon;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown(event);
    if (!disabled && !deletable && clickKeys.indexOf(event.key) !== -1) {
      setActive(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyUp(event);
    setActive(false);
  };

  const handleClick = (event: SyntheticEvent<HTMLDivElement, Event>) => {
    onClick(event);
  };

  const Component = deletable || clickable ? DivButton : "div";

  const renderDeleteIcon = () => {
    if (deleteIconProp && isValidElement<any>(deleteIconProp)) {
      return cloneElement(deleteIconProp, {
        className: cn(
          withBaseName(`deleteButton`),
          deleteIconProp.props.className
        ),
        disabled,
        onClick: onDelete,
      });
    } else {
      return <DeleteButton disabled={disabled} onClick={onDelete} />;
    }
  };

  const { getTriggerProps, getTooltipProps } = useTooltip({
    disabled: !ellipsis && disabled,
    enterDelay,
    placement,
    leaveDelay,
  });

  const { ref: triggerRef, ...triggerProps } = getTriggerProps<
    typeof Component
  >({
    "aria-roledescription": ariaRoledescription,
    className: cn(
      withBaseName(),
      {
        [withBaseName("clickable")]: clickable,
        [withBaseName("deletable")]: deletable && !disabled,
        [withBaseName("disabled")]: disabled,
        [withBaseName("active")]: active,
      },
      className
    ),
    // @ts-ignore
    "data-testid": "pill",
    onKeyDown: disabled ? undefined : handleKeyDown,
    onKeyUp: disabled ? undefined : handleKeyUp,
    onClick: disabled ? undefined : handleClick,
    role: "button",
    tabIndex: disabled ? -1 : 0,
    ...rest,
  });

  const handleRef = useForkRef(triggerRef, ref);

  return (
    <>
      <Tooltip {...getTooltipProps({ title: label })} />
      <Component ref={handleRef} {...triggerProps}>
        {pillIcon || null}
        <div className={withBaseName("label")} ref={labelRef}>
          <span className={withBaseName("innerLabel")}>{label}</span>
        </div>
        {deletable ? renderDeleteIcon() : null}
      </Component>
    </>
  );
});

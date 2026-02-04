import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import ratingItemCss from "./RatingItem.css";

const withBaseName = makePrefixer("saltRatingItem");

export interface RatingItemProps {
  /**
   * specifies the value of the feedback item.
   */
  value: number;
  /**
   * To define if the current star is being hovered.
   */
  isHovered?: boolean;
  /**
   * To specify if the item is selected.
   */
  isSelected?: boolean;
  /**
   * If true, this item should be in the tab order.
   */
  isFocusable?: boolean;
  /**
   * defines the current selected rating.
   */
  currentRating?: number;
  /**
   *  callback function when feedback item is hovered.
   */
  onHover: (event: MouseEvent<HTMLLabelElement>) => void;
  /**
   *  callback function when feedback item is clicked.
   */
  onClick: (event: MouseEvent<HTMLInputElement>) => void;
  /**
   * If true, the rating item will be in a read-only state.
   */
  readOnly?: boolean;
  /**
   * If true, the rating item will be in a disabled state.
   */
  disabled?: boolean;
  /**
   * Custom icon for the outlined state.
   */
  strongIcon?: ReactNode;
  /**
   * Custom icon for the filled state.
   */
  filledIcon?: ReactNode;
  /**
   * Custom icon for the empty state.
   */
  emptyIcon?: ReactNode;
  /**
   * The index of the current rating item in the list of all rating items.
   * This is a zero-based index, starting from 0 for the first item.
   * It can be used to determine the position of the item in the rating component.
   */
  index?: number;
  /**
   * Indicates whether the current rating item is in an active state.
   * An active state typically means that the item is visually highlighted
   * or styled differently to indicate that it is part of the current selection
   * or interaction (e.g., hover or focus).
   */
  isActive?: boolean;
  /**
   * Name of the radio group
   */
  name?: string;
  /**
   * Accessible label for the rating item
   */
  "aria-label"?: string;
}

export const RatingItem = forwardRef<HTMLInputElement, RatingItemProps>(
  function RatingItem(props, ref) {
    const {
      value,
      currentRating,
      isHovered,
      isSelected,
      isFocusable,
      isActive,
      onHover,
      onClick,
      readOnly = false,
      disabled = false,
      filledIcon,
      emptyIcon,
      strongIcon,
      name,
      "aria-label": ariaLabel,
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-rating-item",
      css: ratingItemCss,
      window: targetWindow,
    });

    const isInteractive = !readOnly && !disabled;

    const handleHover = useCallback(
      (event: MouseEvent<HTMLLabelElement>) => {
        if (isInteractive) {
          onHover(event);
        }
      },
      [isInteractive, onHover],
    );

    const icon = useMemo(() => {
      if (isHovered || isSelected) return filledIcon;
      if (isActive) return strongIcon;
      return emptyIcon;
    }, [
      props,
      isHovered,
      isSelected,
      isActive,
      filledIcon,
      strongIcon,
      emptyIcon,
    ]);

    return (
      <label
        className={clsx(withBaseName(), {
          [withBaseName("hovered")]: isHovered,
          [withBaseName("selected")]: isSelected,
          [withBaseName("active")]: isActive,
          [withBaseName("disabled")]: disabled,
          [withBaseName("readOnly")]: readOnly,
        })}
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
      >
        <input
          ref={ref}
          type="radio"
          name={name}
          value={value}
          checked={currentRating === value}
          onClick={onClick}
          disabled={disabled}
          readOnly={readOnly}
          className={withBaseName("input")}
          aria-label={`${value} star${value !== 1 ? "s" : ""}, ${ariaLabel ?? ""}`}
          tabIndex={isFocusable ? 0 : -1}
        />
        <span className={withBaseName("icon")} aria-hidden>
          {icon}
        </span>
      </label>
    );
  },
);

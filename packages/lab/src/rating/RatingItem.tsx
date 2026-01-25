import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  useCallback,
  useMemo,
} from "react";
import ratingItemCss from "./RatingItem.css";

const withBaseName = makePrefixer("saltRatingItem");

export interface RatingItemProps extends Omit<ComponentPropsWithoutRef<"button">, "onClick"> {
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
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
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
  strongIcon?: React.ReactNode;
  /**
   * Custom icon for the filled state.
   */
  filledIcon?: React.ReactNode;
  /**
   * Custom icon for the empty state.
   */
  emptyIcon?: React.ReactNode;
  /**
   * Custom character for the rating icons.
   */
  character?: React.ReactNode | ((props: RatingItemProps) => React.ReactNode);
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
      character,
      filledIcon,
      emptyIcon,
      strongIcon,
      name,
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
      [isInteractive, onHover]
    );

    const icon = useMemo(() => {
      if (character) {
        return typeof character === "function" ? character(props) : character;
      }
      if (isHovered || isSelected) return filledIcon;
      if (isActive) return strongIcon;
      return emptyIcon;
    }, [character, props, isHovered, isSelected, isActive, filledIcon, strongIcon, emptyIcon]);

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
          aria-label={`${value} star${value !== 1 ? 's' : ''}`}
          tabIndex={isFocusable ? 0 : -1}
        />
        <span className={withBaseName("icon")} aria-hidden>
          {icon}
        </span>
      </label>
    );
  },
);

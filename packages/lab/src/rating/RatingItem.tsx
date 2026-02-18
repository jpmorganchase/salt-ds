import { makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
} from "react";
import ratingItemCss from "./RatingItem.css";

const withBaseName = makePrefixer("saltRatingItem");

export interface RatingItemProps extends ComponentPropsWithoutRef<"div"> {
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
   * defines the current selected rating.
   */
  currentRating?: number;
  /**
   *  callback function when feedback item is hovered.
   */
  onMouseEnter: (event: MouseEvent<HTMLInputElement>) => void;
  /**
   *  callback function when feedback item is clicked.
   */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * If true, the rating item will be in a read-only state.
   */
  readOnly?: boolean;
  /**
   * If true, the rating item will be in a disabled state.
   */
  disabled?: boolean;
  /**
   * Indicates whether the current rating item is in an active state.
   * An active state typically means that the item is visually highlighted
   * or styled differently to indicate that it is part of the current selection
   * or interaction (e.g., hover or focus).
   */
  isUnselecting?: boolean;
  /**
   * Name of the radio group
   */
  name?: string;
}

export const RatingItem = forwardRef<HTMLInputElement, RatingItemProps>(
  function RatingItem(props, ref) {
    const {
      "aria-label": ariaLabel,
      value,
      currentRating,
      isHovered,
      isSelected,
      isUnselecting,
      onMouseEnter,
      onChange,
      readOnly = false,
      disabled = false,
      name,
    } = props;

    const { RatingIcon, RatingSelectedIcon, RatingUnselectingIcon } = useIcon();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-rating-item",
      css: ratingItemCss,
      window: targetWindow,
    });

    const icon =
      isHovered || isSelected ? (
        <RatingSelectedIcon aria-hidden />
      ) : isUnselecting ? (
        <RatingUnselectingIcon aria-hidden />
      ) : (
        <RatingIcon aria-hidden />
      );

    return (
      <div
        className={clsx(withBaseName(), {
          [withBaseName("hovered")]: isHovered,
          [withBaseName("selected")]: isSelected,
          [withBaseName("unselecting")]: isUnselecting,
          [withBaseName("disabled")]: disabled,
          [withBaseName("readOnly")]: readOnly,
        })}
      >
        <input
          ref={ref}
          type="radio"
          name={name}
          value={value}
          checked={currentRating === value}
          onChange={onChange}
          onMouseEnter={onMouseEnter}
          disabled={disabled}
          readOnly={readOnly}
          className={withBaseName("input")}
          aria-label={ariaLabel}
        />
        <span className={withBaseName("icon")} aria-hidden>
          {icon}
        </span>
      </div>
    );
  },
);

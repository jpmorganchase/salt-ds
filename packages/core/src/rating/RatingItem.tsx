import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
} from "react";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer } from "../utils";
import ratingItemCss from "./RatingItem.css";

const withBaseName = makePrefixer("saltRatingItem");

export interface RatingItemProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Specifies the value of the feedback item.
   */
  value: number;
  /**
   * If `true`, the item is shown in its hovered state.
   */
  isHovered?: boolean;
  /**
   * If `true`, the item is shown as selected.
   */
  isSelected?: boolean;
  /**
   * Defines the current selected rating.
   */
  currentRating?: number;
  /**
   * Callback fired when the pointer enters the item.
   */
  onMouseEnter: (event: MouseEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the item is selected, for example when it's clicked.
   */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * If `true`, the item is read-only.
   */
  readOnly?: boolean;
  /**
   * If `true`, the item is disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the item is shown in its unselecting state. This is when the
   * item is part of the current selection but is above the hovered rating, so
   * choosing the hovered rating would unselect it.
   */
  isUnselecting?: boolean;
  /**
   * Name of the radio group.
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

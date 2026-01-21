import { makePrefixer } from "@salt-ds/core";
import {
  FavoriteIcon,
  FavoriteStrongIcon,
  FavoriteSolidIcon,
} from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  type ReactElement,
  isValidElement
} from "react";
import ratingItemCss from "./RatingItem.css";

const withBaseName = makePrefixer("saltRatingItem");

export interface RatingItemProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * specifies the value of the feedback item.
   */
  itemValue: number;
  /**
   * To define if the current star is being hovered.
   */
  isCurrentStarHovered?: boolean;
  /**
   * To specify if the item is selected.
   */
  isSelectedStyle?: boolean;
  /**
   * resets the current selection.
   */
  reset?: boolean;
  /**
   * defines the current selected rating.
   */
  currentRating?: number;
  /**
   *  callback function when feedback item is hovered.
   */
  onFeedbackItemHover: (
    event: MouseEvent<HTMLButtonElement>,
    itemValue: number,
  ) => void;
  /**
   *  callback function when feedback item is clicked.
   */
  onFeedbackItemClick: (
    event: MouseEvent<HTMLButtonElement>,
    itemValue: number,
  ) => void;
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
  outlinedIcon?: React.ReactNode;
  /**
   * Custom icon for the filled state.
   */
  filledIcon?: React.ReactNode;
  /**
   * Custom icon for the empty state.
   */
  emptyIcon?: React.ReactNode;
  /**
   * Defines the minimum increment value change allowed.
   */
  precision?: number;
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
  isActiveState?: boolean;
}

export const RatingItem = forwardRef<HTMLButtonElement, RatingItemProps>(
  function RatingItem(props, ref?): ReactElement<RatingItemProps> {
    const {
      itemValue,
      currentRating,
      className,
      isSelectedStyle,
      reset,
      isCurrentStarHovered,
      onFeedbackItemHover,
      onFeedbackItemClick,
      readOnly = false,
      disabled = false,
      isActiveState,
      precision = 1,
      outlinedIcon = props?.emptyIcon || <FavoriteStrongIcon />,
      filledIcon = <FavoriteSolidIcon />,
      emptyIcon = <FavoriteIcon />,
      character,
      index,
      ...restProps
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-rating-item",
      css: ratingItemCss,
      window: targetWindow,
    });

    const handleMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
      if (readOnly || disabled) return; // Prevent hover interaction in read-only mode
      onFeedbackItemHover(event, itemValue);
    };
    const handleMouseLeave = (event: MouseEvent<HTMLButtonElement>) => {
      if (readOnly || disabled) return; // Prevent hover interaction in read-only mode
      onFeedbackItemHover(event, 0);
    };
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (readOnly || disabled) return; // Prevent click interaction in read-only mode
      onFeedbackItemClick(event, itemValue);
    };

    const renderIcon = () => {
      const iconClass = clsx(withBaseName("icon"), {
        [withBaseName("icon-outlined")]: isActiveState,
        [withBaseName("icon-hovered")]: isCurrentStarHovered,
        [withBaseName("icon-filled")]: isSelectedStyle,
        [withBaseName("icon-empty")]:
          !isActiveState && !isCurrentStarHovered && !isSelectedStyle,
      });
      // Render custom character if provided
      if (typeof character === "function") {
        return <div className={iconClass}>{character(props)}</div>;
      }
      // Render the custom character as a React node
      if (isValidElement(character) || typeof character === "string") {
        return <div className={iconClass}>{character}</div>;
      }
      // Determine the icon to render based on the state
      const iconToRender = isActiveState
        ? outlinedIcon
        : isCurrentStarHovered || isSelectedStyle
          ? filledIcon
          : emptyIcon;
      return <div className={iconClass}>{iconToRender}</div>;
    };

    return (
      <button
        data-testid={`salt-${itemValue}`}
        aria-checked={itemValue === currentRating}
        aria-label={`Rating${itemValue}`}
        role="radio"
        tabIndex={
          disabled
            ? -1
            : (readOnly && itemValue === currentRating) ||
                itemValue === currentRating ||
                (itemValue === 1 && currentRating === 0)
              ? 0
              : -1
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={clsx(withBaseName(), className, {
          [withBaseName("read-only")]: readOnly,
          [withBaseName("disabled")]: disabled,
          [withBaseName("current")]: itemValue === currentRating,
        })}
        ref={ref}
        disabled={disabled}
        {...restProps}
      >
        {renderIcon()}
      </button>
    );
  },
);

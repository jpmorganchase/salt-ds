import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import { StarIcon } from "./StarIcon";

const withBaseName = makePrefixer("saltContactFavoriteToggle");

export interface StarIconContainerProps
  extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
  isFocusVisible?: boolean;
  isFocused?: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
}

export const StarIconContainer = forwardRef<
  HTMLSpanElement,
  StarIconContainerProps
>(function StarIconContainer(props, ref) {
  const {
    isSelected,
    isHighlighted,
    isFocused,
    isFocusVisible,
    className,
    ...other
  } = props;

  return (
    <span
      className={clsx(
        withBaseName(),
        {
          [withBaseName("focusVisible")]: isFocusVisible,
        },
        className,
      )}
      {...other}
      ref={ref}
    >
      <StarIcon
        className={clsx(withBaseName("svg"), {
          [withBaseName("focused")]: isFocusVisible && isFocused,
          [withBaseName("selected")]: isSelected && !isHighlighted,
          [withBaseName("selecting")]: !isSelected && isHighlighted,
          [withBaseName("deselected")]: !isSelected && !isHighlighted,
          [withBaseName("deselecting")]: isSelected && isHighlighted,
        })}
        highlighted={isHighlighted}
        selected={isSelected}
      />
    </span>
  );
});

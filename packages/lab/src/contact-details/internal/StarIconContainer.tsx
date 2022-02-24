import React, { forwardRef, HTMLAttributes } from "react";
import classnames from "classnames";
import { makePrefixer } from "@brandname/core";
import { StarIcon } from "./StarIcon";

const withBaseName = makePrefixer("uitkContactFavoriteToggle");

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
      className={classnames(
        withBaseName(),
        {
          [withBaseName("focusVisible")]: isFocusVisible,
        },
        className
      )}
      {...other}
      ref={ref}
    >
      <StarIcon
        className={classnames(withBaseName("svg"), {
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

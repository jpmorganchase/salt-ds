import { useControlled, useForkRef } from "@jpmorganchase/uitk-core";
import React, {
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  MouseEventHandler,
  useState,
} from "react";
import { useIsFocusVisible } from "../../utils";
import { StarIconContainer, StarIconContainerProps } from "./StarIconContainer";

export interface FavoriteToggleProps
  extends Omit<StarIconContainerProps, "onChange"> {
  onBlur?: FocusEventHandler;
  onChange?: (isSelected: boolean) => void;
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onFocus?: FocusEventHandler;
  onKeyDown?: KeyboardEventHandler<HTMLSpanElement>;
  onMouseEnter?: MouseEventHandler<HTMLSpanElement>;
  onMouseLeave?: MouseEventHandler<HTMLSpanElement>;
}

export const FavoriteToggle = forwardRef<HTMLSpanElement, FavoriteToggleProps>(
  function FavoriteToggle(props, ref) {
    const {
      isSelected: isSelectedProp,
      onBlur: onBlurProp,
      onFocus: onFocusProp,
      onClick: onClickProp,
      onChange: onChangeProp,
      onMouseEnter: onMouseEnterProp,
      onMouseLeave: onMouseLeaveProp,
      onKeyDown: onKeyDownProp,
      ...restProps
    } = props;

    const {
      isFocusVisibleRef,
      ref: focusVisibleRef,
      onFocus,
      onBlur,
    } = useIsFocusVisible<HTMLSpanElement>();

    const [isFocused, setIsFocused] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [isFocusVisible, setIsFocusVisible] = useState(false);

    const [isSelected, setIsSelected] = useControlled({
      controlled: isSelectedProp,
      default: false,
      name: "FavoriteToggle",
      state: "isSelected",
    });

    const toggleSelected = () => {
      setIsSelected((s) => !s);
      if (onChangeProp) {
        onChangeProp(!isSelected);
      }
    };

    const handleFocus: FocusEventHandler<HTMLSpanElement> = (event) => {
      if (onFocusProp) {
        onFocusProp(event);
      }
      onFocus(event);
      setIsFocused(true);
      setIsFocusVisible(isFocusVisibleRef.current);
    };

    const handleBlur: FocusEventHandler<HTMLSpanElement> = (event) => {
      if (onBlurProp) {
        onBlurProp(event);
      }
      onBlur();
      setIsFocused(false);
      setIsFocusVisible(false);
    };

    const handleClick: React.MouseEventHandler<HTMLSpanElement> = (event) => {
      if (onClickProp) {
        onClickProp(event);
      }
      setIsFocusVisible(isFocusVisibleRef.current);
      toggleSelected();
    };

    const handleMouseEnter: React.MouseEventHandler<HTMLSpanElement> = (
      event
    ) => {
      if (onMouseEnterProp) {
        onMouseEnterProp(event);
      }
      setIsHighlighted(true);
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLSpanElement> = (
      event
    ) => {
      if (onMouseLeaveProp) {
        onMouseLeaveProp(event);
      }
      setIsHighlighted(false);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (event) => {
      if (onKeyDownProp) {
        onKeyDownProp(event);
      }
      setIsFocusVisible(isFocusVisibleRef.current);

      if (["Enter", " "].includes(event.key)) {
        toggleSelected();
      }
    };

    return (
      <StarIconContainer
        isFocusVisible={isFocusVisible}
        isFocused={isFocused}
        isHighlighted={isHighlighted}
        isSelected={isSelected}
        onBlur={handleBlur}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={useForkRef(focusVisibleRef, ref)}
        tabIndex={0}
        {...restProps}
      />
    );
  }
);

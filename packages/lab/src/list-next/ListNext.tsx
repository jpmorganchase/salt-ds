import { makePrefixer, mergeProps, useForkRef } from "@salt-ds/core";
import {
  Children,
  cloneElement,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  KeyboardEventHandler,
  MouseEvent,
  ReactElement,
  useMemo,
} from "react";
import { clsx } from "clsx";
import { ListItemNext, ListItemNext as DefaultListItem } from "./ListItemNext";
import { useList } from "./useList";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import listNextCss from "./ListNext.css";

const withBaseName = makePrefixer("saltList");
const defaultEmptyMessage = "No data to display";

export interface ListNextProps extends HTMLAttributes<HTMLUListElement> {
  disabled?: boolean;
  emptyMessage?: string;
  ListItem?: ReactElement;
  borderless?: boolean;
  deselectable?: boolean;
  displayedItemCount?: number;
}

export interface ListNextControlProps {
  onBlur: FocusEventHandler;
  onFocus: FocusEventHandler;
  onKeyDown: KeyboardEventHandler;
}

export const ListNext = forwardRef<HTMLUListElement, ListNextProps>(
  function ListNext(
    {
      borderless,
      children,
      className,
      disabled,
      displayedItemCount: displayedItemCountProp,
      deselectable = false,
      ListItem = DefaultListItem,
      emptyMessage,
      onSelect,
      onFocus,
      onBlur,
      onKeyDown,
      style,
      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-hightligher",
      css: listNextCss,
      window: targetWindow,
    });

    const childrenCount = Children.count(children);
    const emptyList = childrenCount === 0;

    const displayedItemCount = useMemo((): number => {
      // if no children, display empty message
      if (emptyList) return 1;

      // displayedItemCount takes precedence over childrenCount
      if (displayedItemCountProp)
        return displayedItemCountProp <= childrenCount
          ? displayedItemCountProp
          : childrenCount;

      // if more than 4 children, display 4 tops
      return childrenCount > 4 ? 4 : childrenCount;
    }, [displayedItemCountProp, children]);

    const {
      listRef,
      focusedIndex,
      selectedIndexes,
      activeDescendant,
      handleClick,
    } = useList({
      children,
      deselectable,
      displayedItemCount,
      onFocus,
      onKeyDown,
      onBlur,
    });
    const forkedRef = useForkRef(ref, listRef);

    function renderEmpty() {
      return (
        <ListItemNext role="presentation">
          {emptyMessage || defaultEmptyMessage}
        </ListItemNext>
      );
    }

    const renderContent = () => {
      return Children.map(children, (listItem, index) => {
        const { disabled: propDisabled, ...restListItemProps } = listItem.props;
        const childProps = {
          disabled: propDisabled || disabled,
          onClick: (e: MouseEvent<HTMLUListElement>) => handleClick(e),
          focused: focusedIndex === index,
          selected: selectedIndexes.includes(index),
          id: `list-item--${index}`,
          ...restListItemProps,
        };

        return (
          isValidElement(listItem) &&
          cloneElement(listItem, { ...mergeProps(listItem.props, childProps) })
        );
      });
    };

    return (
      <ul
        ref={forkedRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("borderless")]: borderless,
            [withBaseName("focusable")]: !childrenCount,
          },
          className
        )}
        role="listbox"
        tabIndex={disabled ? undefined : 0}
        aria-activedescendant={activeDescendant}
        style={{
          ...style,
          "--list-displayedItemCount": displayedItemCount,
        }}
        {...rest}
      >
        {emptyList ? renderEmpty() : renderContent()}
      </ul>
    );
  }
);

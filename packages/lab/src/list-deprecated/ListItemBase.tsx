import { makePrefixer, Tooltip, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ForwardedRef,
  forwardRef,
  type HTMLAttributes,
  memo,
  useRef,
} from "react";
import { useOverflowDetection } from "../utils";
import { Highlighter } from "./internal/Highlighter";

import listItemCss from "./ListItem.css";

//TODO does this need to be generic <Item?
export interface ListItemBaseProps extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  deselectable?: boolean;
  focusVisible?: boolean;
  highlighted?: boolean;
  itemTextHighlightPattern?: RegExp | string;
  selected?: boolean;
  tooltipText?: string;
}

const withBaseName = makePrefixer("saltListItemDeprecated");

// just to keep line number parity
//
export const ListItemBase = memo(
  forwardRef(function ListItemBase(
    props: ListItemBaseProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const {
      className,
      deselectable,
      selected,
      highlighted = false,
      focusVisible,
      tooltipText,
      disabled,
      children,
      itemTextHighlightPattern,
      ...restProps
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-list-item-deprecated",
      css: listItemCss,
      window: targetWindow,
    });

    const { current: detectTruncation } = useRef(typeof children === "string");

    const [overflowRef, isOverflowed] = useOverflowDetection<HTMLDivElement>();
    const setItemRef = useForkRef(overflowRef, ref);

    return (
      <Tooltip disabled={!isOverflowed} content={tooltipText}>
        <div
          aria-label={typeof children === "string" ? children : undefined}
          ref={detectTruncation ? ref : setItemRef}
          {...restProps}
          className={clsx(
            withBaseName(),
            {
              [withBaseName("deselectable")]: deselectable,
              [withBaseName("highlighted")]: highlighted,
              [withBaseName("selected")]: selected,
              [withBaseName("focusVisible")]: focusVisible,
              [withBaseName("disabled")]: disabled,
            },
            className,
          )}
        >
          {detectTruncation ? (
            <span className={withBaseName("textWrapper")} ref={overflowRef}>
              {itemTextHighlightPattern == null ? (
                children
              ) : (
                <Highlighter
                  matchPattern={itemTextHighlightPattern}
                  text={children}
                />
              )}
            </span>
          ) : (
            children
          )}
        </div>
      </Tooltip>
    );
  }),
);

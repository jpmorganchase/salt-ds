import { makePrefixer, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { useOverflowDetection } from "../utils";
import { Highlighter } from "./internal/Highlighter";
import { useTooltip, useTooltipContext } from "../tooltip";

import "./ListItem.css";

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
    ref: ForwardedRef<HTMLDivElement>
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

    const [openTooltip, setOpenTooltip] = useState(false);
    const { Tooltip, enterDelay, leaveDelay, placement } = useTooltipContext();
    const { current: detectTruncation } = useRef(typeof children === "string");

    const [overflowRef, isOverflowed] = useOverflowDetection<HTMLDivElement>();
    const setItemRef = useForkRef(overflowRef, ref);

    useEffect(() => {
      if (detectTruncation && isOverflowed) {
        const timeout = setTimeout(
          () => setOpenTooltip(highlighted),
          highlighted ? enterDelay : leaveDelay
        );

        return () => {
          clearTimeout(timeout);
        };
      }
    }, [highlighted, enterDelay, leaveDelay, detectTruncation, isOverflowed]);

    return (
      <Tooltip
        placement={placement}
        open={openTooltip}
        disabled={!isOverflowed}
        content={tooltipText}
      >
        <div
          ref={detectTruncation ? ref : setItemRef}
          aria-label={typeof children === "string" ? children : undefined}
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
            className
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
  })
);

import {
  makePrefixer,
  useForkRef,
  useTooltip,
  useTooltipContext,
} from "@jpmorganchase/uitk-core";
import cn from "classnames";
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

const withBaseName = makePrefixer("uitkListItemDeprecated");

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

    const { getTooltipProps, getTriggerProps } = useTooltip({
      placement,
      open: openTooltip,
      disabled: !isOverflowed,
    });

    const { ref: triggerRef, ...triggerProps } = getTriggerProps({
      "aria-label": typeof children === "string" ? children : undefined,
      ...restProps,
      className: cn(
        withBaseName(),
        {
          [withBaseName("deselectable")]: deselectable,
          [withBaseName("highlighted")]: highlighted,
          [withBaseName("selected")]: selected,
          [withBaseName("focusVisible")]: focusVisible,
          [withBaseName("disabled")]: disabled,
        },
        className
      ),
    });

    const handleRef = useForkRef(
      triggerRef,
      detectTruncation ? ref : setItemRef
    );

    return (
      <>
        <Tooltip {...getTooltipProps({ title: tooltipText })} />
        <div ref={handleRef} {...triggerProps}>
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
      </>
    );
  })
);

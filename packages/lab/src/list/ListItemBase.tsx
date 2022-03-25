import {
  memo,
  forwardRef,
  useEffect,
  useRef,
  useState,
  ForwardedRef,
  HTMLAttributes,
} from "react";
import classnames from "classnames";
import { makePrefixer } from "@brandname/core";
import { Span } from "@brandname/lab";
import { useForkRef, useOverflowDetection } from "../utils";
import { Highlighter } from "./internal/Highlighter";

import { useTooltipContext } from "../tooltip";

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

const withBaseName = makePrefixer("uitkListItem");

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

    const renderItem = (): JSX.Element => (
      <div
        aria-label={typeof children === "string" ? children : undefined}
        {...restProps}
        className={classnames(
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
        ref={detectTruncation ? ref : setItemRef}
      >
        {detectTruncation ? (
          <Span className={withBaseName("textWrapper")} ref={overflowRef}>
            {itemTextHighlightPattern == null ? (
              children
            ) : (
              <Highlighter
                matchPattern={itemTextHighlightPattern}
                text={children}
              />
            )}
          </Span>
        ) : (
          children
        )}
      </div>
    );

    return renderItem();
    // isOverflowed ? (
    //   <>
    //     <Tooltip open={openTooltip} placement={placement} title={tooltipText}>
    //       {renderItem()}
    //     </Tooltip>
    //   </>
    // ) : (
    //     renderItem()
    //   );
  })
);

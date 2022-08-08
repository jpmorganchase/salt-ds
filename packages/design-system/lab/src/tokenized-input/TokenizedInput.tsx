import { useForkRef, UseTooltipProps } from "@jpmorganchase/uitk-core";
import { ForwardedRef, forwardRef, ReactNode } from "react";
import {
  TokenizedInputBase,
  TokenizedInputBaseProps,
} from "./TokenizedInputBase";
import { useTokenizedInput } from "./useTokenizedInput";

import "./TokenizedInput.css";

export type StringToItem<Item> = (
  selectedItems: Array<Item>,
  value: string
) => Item | null | undefined;

export type ChangeHandler<Item> = (selectedItems: Item[] | undefined) => void;

export interface TokenizedInputProps<Item>
  extends Omit<
    TokenizedInputBaseProps<Item>,
    | "activeIndices"
    | "focused"
    | "highlightedIndex"
    | "helpers"
    | "onRemoveItem"
  > {
  Tooltip?: ReactNode;
  delimiter?: string | Array<string>;
  disableAddOnBlur?: boolean;
  initialSelectedItems?: Array<Item>;
  onChange?: ChangeHandler<Item>;
  onCollapse?: () => void;
  onExpand?: () => void;
  stringToItem?: StringToItem<Item>;
  tooltipEnterDelay?: UseTooltipProps["enterDelay"];
  tooltipLeaveDelay?: UseTooltipProps["leaveDelay"];
  tooltipPlacement?: UseTooltipProps["placement"];
}

export const TokenizedInput = forwardRef(function TokenizedInput<Item>(
  props: TokenizedInputProps<Item>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { inputRef: inputRefProp, ...restProps } = props;

  const { inputRef, helpers, inputProps } = useTokenizedInput(restProps);

  return (
    <TokenizedInputBase
      helpers={helpers}
      inputRef={useForkRef(inputRef, inputRefProp)}
      ref={ref}
      {...inputProps}
    />
  );
});

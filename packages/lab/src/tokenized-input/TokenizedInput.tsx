import { useForkRef, UseTooltipProps } from "@salt-ds/core";
import { ComponentType, ForwardedRef, forwardRef } from "react";
import {
  TokenizedInputBase,
  TokenizedInputBaseProps,
} from "./TokenizedInputBase";
import { useTokenizedInput } from "./useTokenizedInput";

export type StringToItem<Item> = (
  selectedItems: Item[],
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
  Tooltip?: ComponentType;
  delimiter?: string | string[];
  disableAddOnBlur?: boolean;
  initialSelectedItems?: Item[];
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

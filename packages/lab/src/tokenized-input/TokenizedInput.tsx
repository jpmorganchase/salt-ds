import { type UseTooltipProps, useForkRef } from "@salt-ds/core";
import { type ComponentType, type ForwardedRef, forwardRef } from "react";
import {
  TokenizedInputBase,
  type TokenizedInputBaseProps,
} from "./TokenizedInputBase";
import { useTokenizedInput } from "./useTokenizedInput";

/**
 * @deprecated since 1.0.0-alpha.110. Consider `ComboBox` from `@salt-ds/core` with `multiselect` first. If users need to enter their own values, use `TokenizedInputNext`.
 */
export type StringToItem<Item> = (
  selectedItems: Array<Item>,
  value: string,
) => Item | null | undefined;

/**
 * @deprecated since 1.0.0-alpha.110. Consider `ComboBox` from `@salt-ds/core` with `multiselect` first. If users need to enter their own values, use `TokenizedInputNext`.
 */
export type ChangeHandler<Item> = (selectedItems: Item[] | undefined) => void;

/**
 * @deprecated since 1.0.0-alpha.110. Consider `ComboBox` from `@salt-ds/core` with `multiselect` first. If users need to enter their own values, use `TokenizedInputNext`.
 */
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

/**
 * @deprecated since 1.0.0-alpha.110. Consider `ComboBox` from `@salt-ds/core` with `multiselect` first. If users need to enter their own values, use `TokenizedInputNext`.
 */
export const TokenizedInput = forwardRef(function TokenizedInput<Item>(
  props: TokenizedInputProps<Item>,
  ref: ForwardedRef<HTMLDivElement>,
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

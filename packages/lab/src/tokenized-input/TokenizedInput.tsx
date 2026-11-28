import { useForkRef } from "@salt-ds/core";
import { type ForwardedRef, forwardRef } from "react";
import {
  TokenizedInputBase,
  type TokenizedInputBaseProps,
} from "./TokenizedInputBase";
import { useTokenizedInput } from "./useTokenizedInput";

export type StringToItem<Item> = (
  selectedItems: Array<Item>,
  value: string,
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
  delimiter?: string | Array<string>;
  disableAddOnBlur?: boolean;
  initialSelectedItems?: Array<Item>;
  onChange?: ChangeHandler<Item>;
  onCollapse?: () => void;
  onExpand?: () => void;
  stringToItem?: StringToItem<Item>;
}

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

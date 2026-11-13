// These shipped deep-import declarations accepted explicit undefined before TS7.
// Check assignments, not `undefined extends Props[Key]`: reading an optional
// property includes undefined even when assigning it is forbidden.
import type { useComboBox } from "@salt-ds/lab/dist-types/combo-box-deprecated/internal/useComboBox";
import type { useMultiSelectComboBox } from "@salt-ds/lab/dist-types/combo-box-deprecated/internal/useMultiSelectComboBox";

type AcceptsUndefined<Props, Keys extends keyof Props> = {
  [Key in Keys]-?: 0 extends 1 & Props[Key]
    ? false
    : Record<never, never> extends Pick<Props, Key>
      ? { [Name in Key]: undefined } extends Pick<Props, Key>
        ? true
        : false
      : false;
};

type SingleResult = ReturnType<typeof useComboBox<string>>;
type MultiResult = ReturnType<typeof useMultiSelectComboBox<string>>;

// The same 24 optional list fields are affected in each hook.
const optionalListFields = {
  disableTypeToSelect: true,
  highlightedIndex: true,
  tabToSelect: true,
  ListPlaceholder: true,
  borderless: true,
  disableFocus: true,
  disableMouseDown: true,
  disabled: true,
  displayedItemCount: true,
  getItemHeight: true,
  getItemId: true,
  height: true,
  itemCount: true,
  itemGapSize: true,
  itemHeight: true,
  listRef: true,
  maxHeight: true,
  maxWidth: true,
  minHeight: true,
  minWidth: true,
  overscanCount: true,
  restoreLastFocus: true,
  virtualized: true,
  width: true,
} as const;

export const singleListAcceptsUndefined: AcceptsUndefined<
  SingleResult["listProps"],
  keyof typeof optionalListFields
> = optionalListFields;
export const multiListAcceptsUndefined: AcceptsUndefined<
  MultiResult["listProps"],
  keyof typeof optionalListFields
> = optionalListFields;

// Another 13 optional fields are affected in the multiselect input props.
export const multiInputAcceptsUndefined: AcceptsUndefined<
  MultiResult["inputProps"],
  | "disabled"
  | "onFocus"
  | "onBlur"
  | "onKeyUp"
  | "onClick"
  | "onClear"
  | "inputRef"
  | "onInputFocus"
  | "onInputBlur"
  | "onInputChange"
  | "onInputSelect"
  | "expandButtonRef"
  | "onRemoveItem"
> = {
  disabled: true,
  onFocus: true,
  onBlur: true,
  onKeyUp: true,
  onClick: true,
  onClear: true,
  inputRef: true,
  onInputFocus: true,
  onInputBlur: true,
  onInputChange: true,
  onInputSelect: true,
  expandButtonRef: true,
  onRemoveItem: true,
};

// Adding undefined to optional props must not widen required props or lose Item.
export function requiredPropsRemainTyped(
  single: SingleResult,
  multi: MultiResult,
): [readonly string[], readonly string[], string[], boolean, boolean] {
  return [
    single.listProps.source,
    multi.listProps.source,
    multi.inputProps.selectedItems,
    single.listProps.isListOpen,
    multi.listProps.isListOpen,
  ];
}

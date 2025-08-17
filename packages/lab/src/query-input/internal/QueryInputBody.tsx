import { makePrefixer, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { FilterIcon } from "@salt-ds/icons";
import {
  type ChangeEventHandler,
  type FocusEventHandler,
  forwardRef,
  type KeyboardEventHandler,
  type Ref,
  type SyntheticEvent,
  useMemo,
} from "react";

import {
  type ChangeHandler,
  type StringToItem,
  TokenizedInput,
} from "../../tokenized-input";
import type { QueryInputItem } from "../queryInputTypes";
import type { BooleanOperator } from "../useQueryInput";

const withBaseName = makePrefixer("saltQueryInputBody");

export interface QueryInputBodyProps {
  inputRef: Ref<HTMLInputElement>;
  disabled?: boolean;
  showCategory?: boolean;
  selectedItems: QueryInputItem[];
  onBlur: FocusEventHandler<HTMLInputElement>;
  onFocus: FocusEventHandler<HTMLInputElement>;
  onInputFocus: FocusEventHandler<HTMLInputElement>;
  onInputBlur: FocusEventHandler<HTMLInputElement>;
  onInputClick: (event: SyntheticEvent) => void;
  onInputClear: () => void;
  inputValue?: string;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  isFocused?: boolean;
  onSelectedItemsChange: ChangeHandler<QueryInputItem>;
  onKeyDown: KeyboardEventHandler<HTMLInputElement | HTMLButtonElement>;
  booleanOperator: BooleanOperator;
  onBooleanOperatorChange: (newBooleanOperator: BooleanOperator) => void;
}

export const QueryInputBody = forwardRef<HTMLDivElement, QueryInputBodyProps>(
  function QueryInputBody(props, ref) {
    const {
      inputRef,
      disabled,
      selectedItems,
      onInputFocus,
      onInputBlur,
      showCategory,
      inputValue,
      onInputChange,
      isFocused,
      onInputClear,
      onSelectedItemsChange,
      onKeyDown,
      onInputClick,
      booleanOperator,
      onBooleanOperatorChange,
    } = props;

    const itemToString = useMemo(() => {
      if (showCategory) {
        return (item: QueryInputItem) => [item.category, item.value].join(": ");
      }
      return (item: QueryInputItem) => item.value;
    }, [showCategory]);

    const stringToItem: StringToItem<QueryInputItem> = (
      selectedItems,
      value,
    ) => {
      return {
        category: null,
        value,
      };
    };

    const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
      const newBooleanOperator = event.currentTarget.value as BooleanOperator;
      onBooleanOperatorChange(newBooleanOperator);
    };

    return (
      <div ref={ref} className={withBaseName()}>
        <FilterIcon />
        <TokenizedInput
          inputRef={inputRef}
          disabled={disabled}
          className={withBaseName("input")}
          selectedItems={selectedItems}
          // @ts-expect-error
          itemToString={itemToString}
          // @ts-expect-error
          stringToItem={stringToItem}
          onInputFocus={onInputFocus}
          onInputBlur={onInputBlur}
          value={inputValue}
          onClick={onInputClick}
          onInputChange={onInputChange}
          expanded={isFocused}
          onClear={onInputClear}
          // @ts-expect-error
          onChange={onSelectedItemsChange}
          onKeyDown={onKeyDown}
        />
        <div className={withBaseName("separator")} />
        <ToggleButtonGroup
          className={withBaseName("buttonGroup")}
          data-testid="boolean-selector"
          value={booleanOperator}
          onChange={onChange}
        >
          <ToggleButton value="and">And</ToggleButton>
          <ToggleButton value="or">Or</ToggleButton>
        </ToggleButtonGroup>
      </div>
    );
  },
);

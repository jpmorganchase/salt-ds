import { makePrefixer } from "@salt-ds/core";
import { FilterIcon } from "@salt-ds/icons";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  Ref,
  SyntheticEvent,
  useMemo,
} from "react";

import { ToggleButton, ToggleButtonGroup } from "../../toggle-button";
import {
  ChangeHandler,
  StringToItem,
  TokenizedInput,
} from "../../tokenized-input";
import { QueryInputItem } from "../queryInputTypes";
import { BooleanOperator } from "../useQueryInput";

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
      value
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
          itemToString={itemToString as any}
          stringToItem={stringToItem as any}
          onInputFocus={onInputFocus}
          onInputBlur={onInputBlur}
          value={inputValue}
          onClick={onInputClick}
          onInputChange={onInputChange}
          expanded={isFocused}
          onClear={onInputClear}
          onChange={onSelectedItemsChange as any}
          onKeyDown={onKeyDown}
        />
        <div className={withBaseName("separator")} />
        <ToggleButtonGroup
          className={withBaseName("buttonGroup")}
          data-testid="boolean-selector"
          selected={booleanOperator}
          onSelectionChange={onChange}
        >
          <ToggleButton value="and">And</ToggleButton>
          <ToggleButton value="or">Or</ToggleButton>
        </ToggleButtonGroup>
      </div>
    );
  }
);

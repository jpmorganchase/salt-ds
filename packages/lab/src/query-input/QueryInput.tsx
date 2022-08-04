import "./QueryInput.css";
import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import cn from "classnames";

import { QueryInputCategory, QueryInputItem } from "./queryInputTypes";

import {
  BooleanOperator,
  QueryInputBody,
  useQueryInput,
  ValueSelector,
} from "./internal";

const withBaseName = makePrefixer("uitkQueryInput");

export interface QueryInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  disabled?: boolean;
  categories: QueryInputCategory[];
  selectedItems?: QueryInputItem[];
  onChange?: (items: QueryInputItem[]) => void;
  defaultSelectedItems?: QueryInputItem[];
  showCategory?: boolean;
  autoClose?: boolean;
  displayedItemCount?: number;
  booleanOperator?: BooleanOperator;
  onBooleanOperatorChange?: (newOperator: BooleanOperator) => void;
  defaultBooleanOperator?: BooleanOperator;
}

export const QueryInput = forwardRef<HTMLDivElement, QueryInputProps>(
  function QueryInput(props, externalRef) {
    const {
      disabled,
      categories,
      selectedItems,
      onChange,
      defaultSelectedItems,
      showCategory,
      autoClose,
      displayedItemCount,
      booleanOperator,
      onBooleanOperatorChange,
      defaultBooleanOperator,
      className,
      ...restProps
    } = props;

    const {
      queryInputProps,
      queryInputBodyRef,
      queryInputBodyProps,
      valueSelectorProps,
    } = useQueryInput(props, externalRef);

    return (
      <div
        className={cn(withBaseName(), className)}
        onBlur={queryInputProps.onBlur}
        onFocus={queryInputProps.onFocus}
        data-testid="query-input"
        {...restProps}
      >
        <QueryInputBody
          ref={queryInputBodyRef}
          {...queryInputBodyProps}
          showCategory={showCategory}
        />
        <ValueSelector {...valueSelectorProps} />
      </div>
    );
  }
);

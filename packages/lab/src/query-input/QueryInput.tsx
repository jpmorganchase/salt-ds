import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import { QueryInputBody, ValueSelector } from "./internal";
import queryInputCss from "./QueryInput.css";
import type { QueryInputCategory, QueryInputItem } from "./queryInputTypes";
import { type BooleanOperator, useQueryInput } from "./useQueryInput";

const withBaseName = makePrefixer("saltQueryInput");

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

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-query-input",
      css: queryInputCss,
      window: targetWindow,
    });

    const {
      queryInputProps,
      queryInputBodyRef,
      queryInputBodyProps,
      valueSelectorProps,
    } = useQueryInput(props, externalRef);

    return (
      <div
        className={clsx(withBaseName(), className)}
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
  },
);

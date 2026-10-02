import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type Dispatch, type SetStateAction, useCallback } from "react";
import type { SelectionChangeHandler } from "../../common-hooks";
import { List, ListItem, ListItemGroup } from "../../list";
import queryInputCss from "../QueryInput.css";
import type { QueryInputCategory, QueryInputItem } from "../queryInputTypes";

const withBaseName = makePrefixer("saltQueryInputSearchList");

export interface SearchListProps {
  inputValue?: string;
  selectedItems?: QueryInputItem[];
  onChange: (items: QueryInputItem[]) => void;
  rootWidth: number;
  highlightedIndex?: number;
  visibleCategories: QueryInputCategory[];
  setHighlightedIndex: Dispatch<SetStateAction<number>>;
}

function itemToString(item: QueryInputItem) {
  return [item.category, item.value].join(": ");
}

export function SearchList(props: SearchListProps) {
  const {
    inputValue,
    selectedItems,
    onChange: onChangeProp,
    rootWidth,
    highlightedIndex,
    setHighlightedIndex,
    visibleCategories,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-query-input",
    css: queryInputCss,
    window: targetWindow,
  });

  const onChange: SelectionChangeHandler<QueryInputItem, "multiple"> =
    useCallback(
      (_event, items) => {
        onChangeProp(items || []);
      },
      [onChangeProp],
    );

  return (
    <List
      checkable={false}
      data-testid="search-list"
      highlightedIndex={highlightedIndex}
      itemTextHighlightPattern={inputValue}
      itemToString={itemToString}
      onHighlight={setHighlightedIndex}
      onSelectionChange={onChange}
      selectionStrategy="multiple"
      selected={selectedItems}
      width={rootWidth}
    >
      {visibleCategories.map((inputCategory: QueryInputCategory) => {
        return (
          <ListItemGroup key={inputCategory.name} label={inputCategory.name}>
            {inputCategory.values.map((label) => (
              <ListItem key={label} label={label} />
            ))}
          </ListItemGroup>
        );
      })}
      <ListItem className={withBaseName("addKeyword")}>
        {`Add keyword: "${inputValue}"`}
      </ListItem>
    </List>
  );
}

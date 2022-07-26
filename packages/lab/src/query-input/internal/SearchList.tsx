import { Dispatch, FC, SetStateAction, useCallback } from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { List, ListItem as ListItem, ListItemGroup } from "../../list";

import { SelectionChangeHandler } from "../../common-hooks";

import { QueryInputCategory, QueryInputItem } from "../queryInputTypes";
import "../QueryInput.css";

const withBaseName = makePrefixer("uitkQueryInputSearchList");

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

export const SearchList: FC<SearchListProps> = function SearchList(props) {
  const {
    inputValue,
    selectedItems,
    onChange: onChangeProp,
    rootWidth,
    highlightedIndex,
    setHighlightedIndex,
    visibleCategories,
  } = props;

  const onChange: SelectionChangeHandler<QueryInputItem, "multiple"> =
    useCallback(
      (event, items) => {
        onChangeProp(items || []);
      },
      [onChangeProp]
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
};

import {
  Dispatch,
  FC,
  MouseEventHandler,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { makePrefixer } from "@brandname/core";
import {
  List,
  ListChangeHandler,
  ListItem,
  useListItemContext,
} from "../../list";

import { QueryInputCategory, QueryInputItem } from "../QueryInput";
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

interface GroupProps {
  category: QueryInputCategory;
  inputValue?: string;
  selectedItems?: QueryInputItem[];
  onMouseMove: (item: QueryInputItem) => void;
}

interface ValueListItemProps {
  item: QueryInputItem;
  inputValue?: string;
  onMouseMove: (item: QueryInputItem) => void;
}

const ValueListItem: FC<ValueListItemProps> = (props) => {
  const { item, inputValue } = props;

  const onMouseMove: MouseEventHandler = useCallback(() => {
    props.onMouseMove(item);
  }, [props.onMouseMove, item]);

  return (
    <ListItem
      className={withBaseName("value")}
      itemTextHighlightPattern={inputValue || undefined}
      item={item}
      onMouseMove={onMouseMove}
    >
      {item.value}
    </ListItem>
  );
};

const Group: FC<GroupProps> = function Group(props) {
  const { inputValue, category, selectedItems, onMouseMove } = props;
  const { getItemHeight } = useListItemContext();
  const headerStyle = getItemHeight ? { height: getItemHeight() } : {};

  return (
    <div className={withBaseName("group")}>
      <div className={withBaseName("categoryTitle")} style={headerStyle}>
        {category.name}
      </div>
      {category.values.map((v, index) => {
        const item = selectedItems?.find(
          (x) => x.category === category.name && x.value === v
        ) || {
          category: category.name,
          value: v,
        };
        return (
          <ValueListItem
            key={item.value}
            item={item}
            inputValue={inputValue}
            onMouseMove={onMouseMove}
          />
        );
      })}
    </div>
  );
};

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
    visibleCategories,
    setHighlightedIndex,
  } = props;

  const visibleItems = useMemo(() => {
    const visibleItems: QueryInputItem[] = [];
    visibleCategories.forEach((category) => {
      category.values.forEach((value) => {
        visibleItems.push({ category: category.name, value });
      });
    });
    return visibleItems;
  }, [visibleCategories]);

  const onChange: ListChangeHandler<QueryInputItem, "multiple"> = useCallback(
    (event, items) => {
      onChangeProp(items || []);
    },
    [onChangeProp]
  );

  const onMouseMove = useCallback(
    (item: QueryInputItem) => {
      const index = visibleItems.findIndex(
        (x) => x.category === item.category && x.value === item.value
      );
      setHighlightedIndex(index);
    },
    [visibleItems, setHighlightedIndex]
  );

  const onAddKeywordMouseMove = useCallback(() => {
    setHighlightedIndex(visibleItems.length);
  }, [visibleItems.length]);

  return (
    <List
      selectionVariant="multiple"
      selectedItem={selectedItems}
      itemToString={itemToString}
      onChange={onChange}
      width={rootWidth}
      data-testid="search-list"
      highlightedIndex={highlightedIndex}
    >
      {visibleCategories.map((c) => {
        return (
          <Group
            key={c.name}
            category={c}
            inputValue={inputValue}
            selectedItems={selectedItems}
            onMouseMove={onMouseMove}
          />
        );
      })}
      <ListItem
        className={withBaseName("addKeyword")}
        onMouseMove={onAddKeywordMouseMove}
      >
        {`Add keyword: "${inputValue}"`}
      </ListItem>
    </List>
  );
};

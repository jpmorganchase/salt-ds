import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { makePrefixer, useIsomorphicLayoutEffect } from "@brandname/core";
import { QueryInputCategory } from "../QueryInput";
import { List, ListSelectHandler } from "../../list";
import { CategoryListItem } from "./CategoryListItem";
import { CategoryListContext } from "./CategoryListContext";
import { ItemToString } from "../../tokenized-input";

const withBaseName = makePrefixer("uitkCategoryList");

export interface CategoryListProps {
  categories: QueryInputCategory[];
  rootWidth: number;
  onCategorySelect: (category: QueryInputCategory | null) => void;
  highlightedCategoryIndex?: number;
  setHighlightedCategoryIndex: Dispatch<SetStateAction<number>>;
}

const itemToString: ItemToString<QueryInputCategory> = (item) => item.name;

export const CategoryList: FC<CategoryListProps> = function CategoryList(
  props
) {
  const {
    categories,
    rootWidth,
    onCategorySelect,
    highlightedCategoryIndex,
    setHighlightedCategoryIndex,
  } = props;

  const measureRef = useRef<HTMLDivElement>(null);
  const [measuredCategories, setMeasuredCategories] = useState<
    QueryInputCategory[]
  >([]);
  const [contextValue, setContextValue] = useState<CategoryListContext>({
    width: 0,
  });

  useIsomorphicLayoutEffect(() => {
    setTimeout(() => {
      if (measureRef.current) {
        const width = measureRef.current.offsetWidth;
        setMeasuredCategories(categories);
        setContextValue({
          width,
        });
      }
    }, 0);
  }, [measureRef.current, categories, setMeasuredCategories, setContextValue]);

  const onSelect: ListSelectHandler<QueryInputCategory> = useCallback(
    (event, item) => {
      onCategorySelect(item);
    },
    [onCategorySelect]
  );

  const onMouseMove = useCallback(
    (category: QueryInputCategory, index: number) => {
      setHighlightedCategoryIndex(index);
    },
    [setHighlightedCategoryIndex]
  );

  const isMeasuring = measuredCategories !== categories;

  if (isMeasuring) {
    return (
      <div ref={measureRef} className={withBaseName("categoryWidthMeasure")}>
        {categories.map((c, i) => {
          return (
            <div key={i} className={withBaseName("category")}>
              {c.name}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <CategoryListContext.Provider value={contextValue}>
      <List
        width={rootWidth}
        itemToString={itemToString}
        onSelect={onSelect}
        data-testid="category-list"
        highlightedIndex={highlightedCategoryIndex}
      >
        {categories.map((category, index) => {
          return (
            <CategoryListItem
              key={category.name}
              category={category}
              index={index}
              onMouseMove={onMouseMove}
            />
          );
        })}
      </List>
    </CategoryListContext.Provider>
  );
};

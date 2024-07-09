import { makePrefixer, useIsomorphicLayoutEffect } from "@salt-ds/core";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import type { SelectHandler } from "../../common-hooks";
import { List } from "../../list";
import type { QueryInputCategory } from "../queryInputTypes";
import { CategoryListContext } from "./CategoryListContext";
import { CategoryListItem } from "./CategoryListItem";

const withBaseName = makePrefixer("saltCategoryList");

export interface CategoryListProps {
  categories: QueryInputCategory[];
  rootWidth: number;
  onCategorySelect: (category: QueryInputCategory | null) => void;
  highlightedCategoryIndex?: number;
  setHighlightedCategoryIndex: Dispatch<SetStateAction<number>>;
}

const getCategoryLabel = (category: QueryInputCategory) => category.name;

export function CategoryList(props: CategoryListProps) {
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
  }, [categories]);

  const onSelect: SelectHandler<QueryInputCategory> = useCallback(
    (_, item) => {
      onCategorySelect(item);
    },
    [onCategorySelect],
  );

  const isMeasuring = measuredCategories !== categories;

  if (isMeasuring) {
    return (
      <div ref={measureRef} className={withBaseName("categoryWidthMeasure")}>
        {categories.map((c) => {
          return (
            <div key={c.name} className={withBaseName("category")}>
              {c.name}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <CategoryListContext.Provider value={contextValue}>
      <List<QueryInputCategory>
        ListItem={CategoryListItem}
        data-testid="category-list"
        highlightedIndex={highlightedCategoryIndex}
        itemToString={getCategoryLabel}
        onHighlight={setHighlightedCategoryIndex}
        onSelect={onSelect}
        source={categories}
        width={rootWidth}
      />
    </CategoryListContext.Provider>
  );
}

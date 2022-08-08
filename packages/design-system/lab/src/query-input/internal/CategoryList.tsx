import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  makePrefixer,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import { QueryInputCategory } from "../queryInputTypes";
import { SelectHandler } from "../../common-hooks";
import { List } from "../../list";
import { CategoryListItem } from "./CategoryListItem";
import { CategoryListContext } from "./CategoryListContext";

const withBaseName = makePrefixer("uitkCategoryList");

export interface CategoryListProps {
  categories: QueryInputCategory[];
  rootWidth: number;
  onCategorySelect: (category: QueryInputCategory | null) => void;
  highlightedCategoryIndex?: number;
  setHighlightedCategoryIndex: Dispatch<SetStateAction<number>>;
}

const getCategoryLabel = (category: QueryInputCategory) => category.name;

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
  }, [categories, setMeasuredCategories, setContextValue]);

  const onSelect: SelectHandler<QueryInputCategory> = useCallback(
    (_, item) => {
      onCategorySelect(item);
    },
    [onCategorySelect]
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
};

import { QueryInputCategory, QueryInputItem } from "../QueryInput";
import { Dispatch, FC, Ref, SetStateAction, useMemo } from "react";
import { makePrefixer } from "@brandname/core";
import { ValueList } from "./ValueList";
import { CategoryList } from "./CategoryList";
import { Popper } from "../../popper";
import { SearchList } from "./SearchList";

const withBaseName = makePrefixer("uitkQueryInputValueSelector");

export interface ValueSelectorProps {
  isOpen: boolean;
  anchorElement: HTMLElement | null;
  popperRef: Ref<HTMLDivElement>;

  inputValue?: string;
  categories: QueryInputCategory[];
  selectedCategory: QueryInputCategory | null;
  onSelectedCategoryChange: (category: QueryInputCategory | null) => void;

  width: number;
  selectedItems: QueryInputItem[];
  onValueToggle: (category: QueryInputCategory, value: string) => void;
  onSearchListChange: (items: QueryInputItem[]) => void;

  highlightedIndex?: number;
  visibleCategories: QueryInputCategory[];

  highlightedCategoryIndex?: number;
  highlightedValueIndex?: number;

  setHighlightedIndex: Dispatch<SetStateAction<number>>;
  setHighlightedCategoryIndex: Dispatch<SetStateAction<number>>;
  setHighlightedValueIndex: Dispatch<SetStateAction<number>>;
}

export const ValueSelector: FC<ValueSelectorProps> = function (props) {
  const {
    isOpen,
    inputValue,
    anchorElement,
    popperRef,
    categories,
    selectedCategory,
    onSelectedCategoryChange,
    width,
    selectedItems,
    onValueToggle,
    highlightedIndex,
    visibleCategories,
    highlightedCategoryIndex,
    highlightedValueIndex,
    onSearchListChange,
    setHighlightedValueIndex,
    setHighlightedCategoryIndex,
    setHighlightedIndex,
  } = props;

  const selectedCategoryValues = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    return selectedItems
      .filter((item) => item.category === selectedCategory.name)
      .map(({ value }) => value);
  }, [selectedCategory, selectedItems]);

  const onBackToCategories = () => {
    onSelectedCategoryChange(null);
  };

  const renderContent = () => {
    if (inputValue) {
      return (
        <SearchList
          inputValue={inputValue}
          selectedItems={selectedItems}
          onChange={onSearchListChange}
          rootWidth={width}
          highlightedIndex={highlightedIndex}
          visibleCategories={visibleCategories}
          setHighlightedIndex={setHighlightedIndex}
        />
      );
    }

    if (!selectedCategory) {
      return (
        <CategoryList
          categories={categories}
          rootWidth={width}
          onCategorySelect={onSelectedCategoryChange}
          highlightedCategoryIndex={highlightedCategoryIndex}
          setHighlightedCategoryIndex={setHighlightedCategoryIndex}
        />
      );
    }

    return (
      <ValueList
        category={selectedCategory}
        rootWidth={width}
        onBack={onBackToCategories}
        selectedValues={selectedCategoryValues}
        onValueToggle={onValueToggle}
        highlightedValueIndex={highlightedValueIndex}
        setHighlightedValueIndex={setHighlightedValueIndex}
      />
    );
  };

  return (
    <Popper
      anchorEl={anchorElement}
      open={isOpen}
      placement={"bottom"}
      ref={popperRef}
    >
      <div className={withBaseName("content")}>{renderContent()}</div>
    </Popper>
  );
};

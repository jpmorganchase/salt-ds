import {
  makePrefixer,
  Portal,
  useFloatingUI,
  useForkRef,
  useIsomorphicLayoutEffect,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { Dispatch, FC, Ref, SetStateAction, useMemo } from "react";
import { QueryInputCategory, QueryInputItem } from "../QueryInput";
import { CategoryList } from "./CategoryList";
import { SearchList } from "./SearchList";
import { ValueList } from "./ValueList";

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

  const Window = useWindow();
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom",
  });
  const handleRef = useForkRef<HTMLDivElement>(floating, popperRef);
  useIsomorphicLayoutEffect(() => {
    if (anchorElement) {
      reference(anchorElement);
    }
  }, [reference, anchorElement]);

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Window
        style={{
          top: y ?? "",
          left: x ?? "",
          position: strategy,
        }}
        ref={handleRef}
      >
        <div className={withBaseName("content")}>{renderContent()}</div>
      </Window>
    </Portal>
  );
};

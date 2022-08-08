import { useControlled, useForkRef } from "@jpmorganchase/uitk-core";
import {
  ChangeEventHandler,
  FocusEventHandler,
  ForwardedRef,
  KeyboardEventHandler,
  Ref,
  RefObject,
  useMemo,
  useRef,
  useState,
} from "react";
import { QueryInputProps } from "../QueryInput";
import { QueryInputCategory, QueryInputItem } from "../queryInputTypes";
import { QueryInputBodyProps } from "./QueryInputBody";
import { usePopperStatus } from "./usePopperStatus";
import { ValueSelectorProps } from "./ValueSelector";
import { useWidth } from "../../responsive";

export type BooleanOperator = "or" | "and";

export interface UseQueryInputResult {
  queryInputProps: {
    onFocus: FocusEventHandler<HTMLDivElement>;
    onBlur: FocusEventHandler<HTMLDivElement>;
  };
  queryInputBodyRef: Ref<HTMLDivElement>;
  queryInputBodyProps: QueryInputBodyProps;
  valueSelectorProps: ValueSelectorProps;
}

export function useQueryInput(
  props: QueryInputProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
): UseQueryInputResult {
  const bodyRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [widthBodyRef, bodyWidth] = useWidth<HTMLDivElement>(true);

  const forkedRef1 = useForkRef<HTMLDivElement>(
    forwardedRef,
    bodyRef
  ) as RefObject<HTMLDivElement>;
  const queryInputBodyRef = useForkRef<HTMLDivElement>(
    forkedRef1,
    widthBodyRef
  );

  const [selectedItems, setSelectedItems] = useControlled({
    controlled: props.selectedItems,
    default: props.defaultSelectedItems || [],
    name: "QueryInput",
    state: "selectedItems",
  });

  const [booleanOperator, setBooleanOperator] = useControlled({
    controlled: props.booleanOperator,
    default: props.defaultBooleanOperator || "and",
    name: "QueryInput",
    state: "booleanOperator",
  });

  const popperStatus = usePopperStatus({
    initialOpen: false,
    autoClose: props.autoClose,
  });

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [highlightedCategoryIndex, setHighlightedCategoryIndex] = useState(0);
  const [highlightedValueIndex, setHighlightedValueIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<QueryInputCategory | null>(null);
  const searchListIndexPositions = useRef<Array<QueryInputCategory | string>>(
    []
  );

  const onInputFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    popperStatus.onFocus(event);
    setIsFocused(true);
  };

  const onInputBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    if (!inputRef.current) {
      return;
    }
    const relatedTarget = event.relatedTarget as Node | null;
    const isBodyFocused = bodyRef.current === relatedTarget;
    if (isBodyFocused) {
      inputRef.current.focus();
      return;
    }
    const isFocusWithinBody =
      bodyRef.current && bodyRef.current.contains(relatedTarget);
    if (isFocusWithinBody) {
      return;
    }
    const isFocusWithinPopper =
      popperRef.current && popperRef.current.contains(relatedTarget);
    if (isFocusWithinPopper) {
      inputRef.current.focus();
      return;
    }
    setIsFocused(false);
    popperStatus.onBlur(event);
  };

  const onFocus: FocusEventHandler<HTMLDivElement> = (event) => {
    setIsFocused(true);
    popperStatus.onFocus(event);
  };

  const onBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    let relatedTarget = event.relatedTarget as Node | null;
    const isBodyFocused = bodyRef.current === relatedTarget;
    if (isBodyFocused) {
      return;
    }
    const isFocusWithinBody =
      bodyRef.current && bodyRef.current.contains(relatedTarget);
    if (isFocusWithinBody) {
      return;
    }
    const isFocusWithinPopper =
      popperRef.current && popperRef.current.contains(relatedTarget);
    if (isFocusWithinPopper) {
      return;
    }
    setIsFocused(false);
    popperStatus.onBlur(event);
  };

  const onSelectedItemsChange = (newItems: QueryInputItem[] | undefined) => {
    const newItem =
      newItems &&
      newItems.find(
        (item) => item.category == null && item.value === inputValue
      );
    if (newItem) {
      setInputValue("");
    }
    setSelectedItems(newItems || []);
    if (props.onChange) {
      props.onChange(newItems || []);
    }
    popperStatus.onChange();
  };

  const onBooleanOperatorChange = (operator: BooleanOperator) => {
    setBooleanOperator(operator);
    if (props.onBooleanOperatorChange) {
      props.onBooleanOperatorChange(operator);
    }
  };

  const onSelectedCategoryChange = (category: QueryInputCategory | null) => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setSelectedCategory(category);
  };

  const [inputValue, setInputValue] = useState<string>("");

  const searchListItems = useMemo(() => {
    const [searchListItems, indexPositions] = filterCategories(
      props.categories,
      inputValue
    );
    searchListIndexPositions.current = indexPositions;
    return searchListItems;
  }, [props.categories, inputValue]);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newInputValue = event.target.value;
    setInputValue(newInputValue);
    // If we have search results, the first index position will be a header
    setHighlightedIndex(searchListIndexPositions.current.length === 0 ? 0 : 1);
  };

  const searchListItemCount = useMemo(() => {
    return searchListItems.reduce(
      (acc, category) => acc + category.values.length,
      0
    );
  }, [searchListItems]);

  const onInputClear = () => {
    onSelectedItemsChange([]);
  };

  const onInputClick = () => {
    popperStatus.onClick();
  };

  const newItemFromSelected = (): QueryInputItem | undefined => {
    const i = highlightedIndex;
    for (const category of searchListItems) {
      if (i < category.values.length) {
        const value = category.values[i];
        return {
          category: category.name,
          value,
        };
      }
    }
  };

  const { displayedItemCount = 10 } = props;

  const onSearchListKeyDown = (key: string) => {
    switch (key) {
      case "Home":
        setHighlightedIndex(0);
        return;
      case "End":
        setHighlightedIndex(searchListItemCount);
        return;
      case "ArrowUp":
        setHighlightedIndex((i) =>
          prevSearchItemIndex(i, searchListIndexPositions.current)
        );
        return;
      case "ArrowDown":
        // setHighlightedIndex((i) => Math.min(searchListItemCount, i + 1));
        setHighlightedIndex((i) =>
          nextSearchItemIndex(i, searchListIndexPositions.current)
        );
        return;
      case "PageDown":
        setHighlightedIndex((i) =>
          Math.min(searchListItemCount, i + displayedItemCount)
        );
        return;
      case "PageUp":
        setHighlightedIndex((i) => Math.max(0, i - displayedItemCount));
        return;
      case "Enter":
        if (highlightedIndex === searchListItemCount) {
          const newItems = [
            ...selectedItems,
            { category: null, value: inputValue },
          ];
          onSelectedItemsChange(newItems);
        } else {
          if (highlightedIndex >= 0 && highlightedIndex < searchListItemCount) {
            const newItem = newItemFromSelected();
            if (newItem) {
              const newItems = [...selectedItems, newItem];
              onSelectedItemsChange(newItems);
            }
          }
          setInputValue("");
        }
        return;
      default:
        return;
    }
  };

  const onCategoryListKeyDown = (key: string) => {
    switch (key) {
      case "Home":
        setHighlightedCategoryIndex(0);
        return;
      case "End":
        setHighlightedCategoryIndex(props.categories.length - 1);
        return;
      case "ArrowUp":
        setHighlightedCategoryIndex((i) => Math.max(0, i - 1));
        return;
      case "ArrowDown":
        setHighlightedCategoryIndex((i) =>
          Math.min(props.categories.length - 1, i + 1)
        );
        return;
      case "PageUp":
        setHighlightedCategoryIndex((i) => Math.max(0, i - displayedItemCount));
        return;
      case "PageDown":
        setHighlightedCategoryIndex((i) =>
          Math.min(props.categories.length - 1, i + displayedItemCount)
        );
        return;
      case "Enter":
        if (
          highlightedCategoryIndex >= 0 &&
          highlightedCategoryIndex < props.categories.length
        ) {
          const category = props.categories[highlightedCategoryIndex];
          setSelectedCategory(category);
        }
        return;
      case "ArrowRight":
        if (
          highlightedCategoryIndex >= 0 &&
          highlightedCategoryIndex < props.categories.length
        ) {
          const category = props.categories[highlightedCategoryIndex];
          setSelectedCategory(category);
        }
        return;
      default:
        return;
    }
  };

  const onValueListKeyDown = (key: string) => {
    switch (key) {
      case "Home":
        setHighlightedValueIndex(0);
        return;
      case "End":
        setHighlightedValueIndex(selectedCategory!.values.length);
        return;
      case "ArrowUp":
        setHighlightedValueIndex((i) => Math.max(0, i - 1));
        return;
      case "ArrowDown":
        setHighlightedValueIndex((i) =>
          Math.min(selectedCategory!.values.length, i + 1)
        );
        return;
      case "PageUp":
        setHighlightedValueIndex((i) => Math.max(0, i - displayedItemCount));
        return;
      case "PageDown":
        setHighlightedValueIndex((i) =>
          Math.min(selectedCategory!.values.length, i + displayedItemCount)
        );
        return;
      case "Enter":
        if (highlightedValueIndex === 0) {
          setSelectedCategory(null);
        } else {
          const value = selectedCategory!.values[highlightedValueIndex - 1];
          const newItems = selectedItems.filter(
            (item) =>
              !(
                item.category === selectedCategory!.name && item.value === value
              )
          );
          if (newItems.length === selectedItems.length) {
            newItems.push({ category: selectedCategory!.name, value });
          }
          onSelectedItemsChange(newItems);
        }
        return;
      case "ArrowLeft":
        setSelectedCategory(null);
        return;
      default:
        return;
    }
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    popperStatus.onKeyDown(event);
    let key = event.key;
    if (event.key === " " && event.ctrlKey) {
      key = "Enter";
    }
    const isSearchListActive = inputValue !== "";
    const isCategoryListActive = !isSearchListActive && !selectedCategory;
    const isValueListActive = !isSearchListActive && !isCategoryListActive;
    if (isSearchListActive) {
      onSearchListKeyDown(key);
    } else if (isCategoryListActive) {
      onCategoryListKeyDown(key);
    } else {
      onValueListKeyDown(key);
    }
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "Enter":
        event.preventDefault();
        break;
      case "ArrowLeft":
        if (isValueListActive) {
          event.preventDefault();
        }
        break;
      case "ArrowRight":
        if (isCategoryListActive) {
          event.preventDefault();
        }
        break;
      case "Escape":
        setInputValue("");
    }
  };

  const onValueToggle = (category: QueryInputCategory, value: string) => {
    const newItems = selectedItems.filter(
      (item) => !(item.category === category.name && item.value === value)
    );
    if (newItems.length === selectedItems.length) {
      newItems.push({ category: category.name, value });
    }
    onSelectedItemsChange(newItems);
  };

  return {
    queryInputBodyRef,
    queryInputProps: {
      onFocus,
      onBlur,
    },
    queryInputBodyProps: {
      inputRef: inputRef,
      disabled: props.disabled,
      selectedItems,
      onFocus,
      onBlur,
      onInputClick,
      onInputFocus,
      onInputBlur,
      onInputClear,
      inputValue,
      onInputChange,
      onSelectedItemsChange,
      onKeyDown,
      isFocused,
      booleanOperator,
      onBooleanOperatorChange,
    },
    valueSelectorProps: {
      isOpen: popperStatus.isOpen,
      categories: props.categories,
      selectedCategory,
      selectedItems,
      onValueToggle,
      onSearchListChange: onSelectedItemsChange,
      anchorElement: bodyRef.current,
      width: bodyWidth,
      onSelectedCategoryChange,
      popperRef,
      inputValue,
      highlightedIndex,
      visibleCategories: searchListItems,
      highlightedCategoryIndex,
      highlightedValueIndex,
      setHighlightedCategoryIndex,
      setHighlightedValueIndex,
      setHighlightedIndex,
    },
  };
}

function filterCategories(
  categories: QueryInputCategory[],
  inputValue?: string
): [QueryInputCategory[], Array<QueryInputCategory | string>] {
  // Note: if there is no input value, this List would not be display
  if (!inputValue) {
    return [categories, []];
  }
  const query = inputValue.toUpperCase();
  const visibleCategories: QueryInputCategory[] = [];
  const indexPositions: Array<QueryInputCategory | string> = [];
  for (const c of categories) {
    const values = c.values.filter((v) => v.toUpperCase().includes(query));
    if (values.length > 0) {
      const queryInputCategory = {
        name: c.name,
        values,
      };
      visibleCategories.push(queryInputCategory);
      indexPositions.push(queryInputCategory, ...values);
    }
  }
  return [visibleCategories, indexPositions];
}

function nextSearchItemIndex(
  index: number,
  indexPositions: Array<QueryInputCategory | string>
) {
  const nextIndex = index + 1;
  // Note: allow 1 for the extra ListItem we append to end of List
  if (nextIndex === indexPositions.length + 1) {
    return index;
  } else if (nextIndex === indexPositions.length) {
    return nextIndex;
  } else if (typeof indexPositions[nextIndex] === "string") {
    return nextIndex;
  } else {
    return nextIndex + 1;
  }
}

function prevSearchItemIndex(
  index: number,
  indexPositions: Array<QueryInputCategory | string>
) {
  const nextIndex = index - 1;
  if (nextIndex === 0) {
    return index;
  } else if (typeof indexPositions[nextIndex] === "string") {
    return nextIndex;
  } else {
    return nextIndex - 1;
  }
}

import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useControlled } from "@salt-ds/core";
import { OptionValue } from "./ListControlContext";

export interface ListControlProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (event: SyntheticEvent, newOpen: boolean) => void;
  defaultSelected?: string[];
  selected?: string[];
  onSelectionChange?: (event: SyntheticEvent, newSelected: string[]) => void;
  defaultValue?: string;
  value?: string;
  multiselect?: boolean;
}

export function useListControl(props: ListControlProps) {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected: selectedProp,
    onSelectionChange,
    defaultValue,
    value,
  } = props;

  const [focusedState, setFocusedState] = useState(false);
  const [focusVisibleState, setFocusVisibleState] = useState(false);

  const [valueState, setValueState] = useControlled({
    controlled: value,
    default: defaultValue,
    name: "ListControl",
    state: "value",
  });

  const [activeState, setActiveState] = useState<OptionValue | undefined>(
    undefined
  );

  const setActive = (option?: OptionValue) => {
    if (option) {
      setActiveState(option);
    } else {
      setActiveState(undefined);
    }
  };

  const [openState, setOpenState] = useControlled({
    controlled: openProp,
    default: Boolean(defaultOpen),
    name: "ListControl",
    state: "open",
  });

  const setOpen = (event: SyntheticEvent, newOpen: boolean) => {
    setOpenState(newOpen);
    onOpenChange?.(event, newOpen);
  };

  const [selectedState, setSelectedState] = useControlled({
    controlled: selectedProp,
    default: defaultSelected ?? [],
    name: "ListControl",
    state: "selected",
  });

  const select = (event: SyntheticEvent, option: OptionValue) => {
    const { disabled, value } = option;

    if (disabled) {
      return;
    }

    let newSelected = [value];

    if (multiselect) {
      if (selectedState.includes(value)) {
        newSelected = selectedState.filter((item) => item !== value);
      } else {
        newSelected = selectedState.concat([value]);
      }
    }

    setSelectedState(newSelected);
    setValueState(
      getOptionsMatching((option) => newSelected.includes(option.value))
        .map((option) => option.text)
        .join(", ")
    );
    onSelectionChange?.(event, newSelected);
  };

  const optionsRef = useRef<{ value: OptionValue; element: HTMLElement }[]>([]);

  const register = useCallback(
    (optionValue: OptionValue, element: HTMLElement) => {
      const { id } = optionValue;
      const option = optionsRef.current.find((item) => item.value.id === id);
      const index = optionsRef.current.findIndex((option) => {
        return (
          option.element.compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_PRECEDING
        );
      });

      if (!option) {
        if (index === -1) {
          optionsRef.current.push({ value: optionValue, element });
        } else {
          optionsRef.current.splice(index, 0, { value: optionValue, element });
        }
      }

      return () => {
        optionsRef.current = optionsRef.current.filter(
          (item) => item.value.id !== id
        );
      };
    },
    []
  );

  const getOptionAtIndex = (index: number) => {
    return optionsRef.current[index]?.value;
  };

  const getIndexOfOption = (option: OptionValue) => {
    return optionsRef.current.findIndex((item) => item.value.id === option.id);
  };

  const getOptionsMatching = (predicate: (option: OptionValue) => boolean) => {
    return optionsRef.current
      .filter((item) => predicate(item.value))
      .map((item) => item.value);
  };

  const getOptionFromSearch = (search: string, startFrom?: OptionValue) => {
    const collator = new Intl.Collator("en", {
      usage: "search",
      sensitivity: "base",
    });

    const startIndex = startFrom ? getIndexOfOption(startFrom) + 1 : 0;
    const searchList = optionsRef.current.map((item) => item.value);

    let matches = searchList.filter(
      (option) =>
        collator.compare(option.text.substring(0, search.length), search) === 0
    );

    if (matches.length === 0) {
      const letters = search.split("");
      const allSameLetter =
        letters.length > 0 &&
        letters.every((letter) => collator.compare(letter, letters[0]) === 0);
      if (allSameLetter) {
        matches = searchList.filter(
          (option) =>
            collator.compare(option.text[0].toLowerCase(), letters[0]) === 0
        );
      }
    }

    return matches.find((option) => getIndexOfOption(option) >= startIndex);
  };

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listRef.current) {
      const activeElement = optionsRef.current.find(
        (option) => option.value === activeState
      )?.element;

      if (!activeElement) {
        return;
      }

      const { scrollTop } = listRef.current;
      const { offsetTop, offsetHeight } = activeElement;

      const isVisible =
        offsetTop >= scrollTop &&
        offsetTop + offsetHeight <= scrollTop + listRef.current.offsetHeight;

      if (!isVisible) {
        activeElement.scrollIntoView({
          block: "end",
          inline: "nearest",
        });
      }
    }
  }, [activeState]);

  return {
    multiselect: Boolean(multiselect),
    openState,
    setOpen,
    activeState,
    setActive,
    selectedState,
    select,
    valueState,
    focusVisibleState,
    setFocusVisibleState,
    focusedState,
    setFocusedState,
    listRef,
    options: optionsRef.current.map((option) => option.element),
    register,
    getOptionAtIndex,
    getIndexOfOption,
    getOptionsMatching,
    getOptionFromSearch,
  };
}

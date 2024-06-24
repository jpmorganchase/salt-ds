import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useControlled } from "../utils";
import { OptionValue } from "./ListControlContext";

export type OpenChangeReason = "input" | "manual";

export type ListControlProps<Item> = {
  /**
   * If true, the control will be disabled.
   */
  disabled?: boolean;
  /**
   * If true, the control will be read-only.
   */
  readOnly?: boolean;
  /**
   * If true, the list will be open by default.
   */
  defaultOpen?: boolean;
  /**
   * If true, the list will be open. Useful for controlling the component.
   */
  open?: boolean;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (newOpen: boolean, reason?: OpenChangeReason) => void;
  /**
   * The default selected options. If this is provided `defaultValue` should be provided as well.
   */
  defaultSelected?: Item[];
  /**
   * The selected options. The component will be controlled if this prop is provided.
   */
  selected?: Item[];
  /**
   * Callback fired when the selected options change.
   */
  onSelectionChange?: (event: SyntheticEvent, newSelected: Item[]) => void;
  /**
   * If true, multiple options can be selected.
   */
  multiselect?: boolean;
  /**
   * Callback used to convert an option's `value` to a string. This is needed when the value is different to the display value or the value is not a string.
   */
  valueToString?: (item: Item) => string;
};

export function defaultValueToString<Item>(item: Item): string {
  return typeof item === "string" ? item : "";
}

export function useListControl<Item>(props: ListControlProps<Item>) {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    multiselect,
    defaultSelected,
    selected: selectedProp,
    onSelectionChange,
    disabled,
    readOnly,
    valueToString = defaultValueToString,
  } = props;

  const [focusedState, setFocusedState] = useState(false);
  const [focusVisibleState, setFocusVisibleState] = useState(false);

  useEffect(() => {
    // remove focus when controlling disabled
    if (disabled && focusedState) {
      setFocusedState(false);
      setFocusVisibleState(false);
    }
  }, [disabled, focusedState, setFocusedState]);

  const [activeState, setActiveState] = useState<OptionValue<Item> | undefined>(
    undefined
  );

  const setActive = (option?: OptionValue<Item>) => {
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

  const openKey = useRef<string | undefined>(undefined);

  const setOpen = (
    newOpen: boolean,
    reason?: OpenChangeReason,
    key?: string
  ) => {
    if (disabled || readOnly) {
      return;
    }

    setOpenState(newOpen);
    openKey.current = key;

    if (newOpen !== openState) {
      onOpenChange?.(newOpen, reason);
    }
  };

  const [selectedState, setSelectedState] = useControlled({
    controlled: selectedProp,
    default: defaultSelected ?? [],
    name: "ListControl",
    state: "selected",
  });

  const select = (event: SyntheticEvent, option: OptionValue<Item>) => {
    if (option.disabled || readOnly || disabled) {
      return;
    }

    let newSelected = [option.value];

    if (multiselect) {
      if (selectedState.includes(option.value)) {
        newSelected = selectedState.filter((item) => item !== option.value);
      } else {
        newSelected = selectedState.concat([option.value]);
      }
    }

    setSelectedState(newSelected);
    onSelectionChange?.(event, newSelected);

    if (!multiselect) {
      setOpen(false);
    }
  };

  const clear = (event: SyntheticEvent) => {
    setSelectedState([]);
    if (selectedState.length !== 0) {
      onSelectionChange?.(event, []);
    }
  };

  const optionsRef = useRef<
    { data: OptionValue<Item>; element: HTMLElement }[]
  >([]);

  const register = useCallback(
    (optionValue: OptionValue<Item>, element: HTMLElement) => {
      const { id } = optionValue;
      const option = optionsRef.current.find((item) => item.data.id === id);
      const index = optionsRef.current.findIndex((option) => {
        return (
          option.element.compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_PRECEDING
        );
      });

      if (!option) {
        if (index === -1) {
          optionsRef.current.push({ data: optionValue, element });
        } else {
          optionsRef.current.splice(index, 0, { data: optionValue, element });
        }
      }

      return () => {
        optionsRef.current = optionsRef.current.filter(
          (item) => item.data.id !== id
        );
      };
    },
    []
  );

  const getOptionAtIndex = (index: number) => {
    return optionsRef.current[index];
  };

  const getIndexOfOption = (option: OptionValue<Item>) => {
    return optionsRef.current.findIndex((item) => item.data.id === option.id);
  };

  const getOptionsMatching = (
    predicate: (option: OptionValue<Item>) => boolean
  ) => {
    return optionsRef.current.filter((item) => predicate(item.data));
  };

  const getOptionFromSearch = (
    search: string,
    startFrom?: OptionValue<Item>
  ) => {
    const collator = new Intl.Collator("en", {
      usage: "search",
      sensitivity: "base",
    });

    const startIndex = startFrom ? getIndexOfOption(startFrom) + 1 : 0;
    const searchList = optionsRef.current.map((item) => item.data);

    let matches = searchList.filter(
      (option) =>
        collator.compare(
          valueToString(option.value).substring(0, search.length),
          search
        ) === 0
    );

    if (matches.length === 0) {
      const letters = search.split("");
      const allSameLetter =
        letters.length > 0 &&
        letters.every((letter) => collator.compare(letter, letters[0]) === 0);
      if (allSameLetter) {
        matches = searchList.filter(
          (option) =>
            collator.compare(
              valueToString(option.value)[0].toLowerCase(),
              letters[0]
            ) === 0
        );
      }
    }

    return matches.find((option) => getIndexOfOption(option) >= startIndex);
  };

  const getFirstOption = () => {
    return getOptionAtIndex(0);
  };

  const getLastOption = () => {
    return getOptionAtIndex(optionsRef.current.length - 1);
  };

  const getOptionBefore = (option: OptionValue<Item>) => {
    const index = getIndexOfOption(option);
    return getOptionAtIndex(index - 1);
  };

  const getOptionAfter = (option: OptionValue<Item>) => {
    const index = getIndexOfOption(option);
    return getOptionAtIndex(index + 1);
  };

  const listRef = useRef<HTMLDivElement>(null);

  const getOptionPageAbove = (start: OptionValue<Item>) => {
    const list = listRef.current;
    let option = optionsRef.current.find((option) => option.data === start);

    if (!list || !option) {
      return null;
    }

    const containerRect = list.getBoundingClientRect();
    let optionRect = option.element.getBoundingClientRect();

    let listY = containerRect.y - list.scrollTop;
    let pageY = Math.max(
      0,
      optionRect.y - listY + optionRect.height - containerRect.height
    );

    while (option && optionRect.y - listY > pageY) {
      option = getOptionBefore(option.data);
      optionRect = option?.element.getBoundingClientRect();
    }

    return option ?? getFirstOption();
  };

  const getOptionPageBelow = (start: OptionValue<Item>) => {
    const list = listRef.current;
    let option = optionsRef.current.find((option) => option.data === start);

    if (!list || !option) {
      return null;
    }

    const containerRect = list.getBoundingClientRect();
    let optionRect = option.element.getBoundingClientRect();

    let listY = containerRect.y - list.scrollTop;
    let pageY = Math.min(
      list.scrollHeight,
      optionRect.y - listY - optionRect.height + containerRect.height
    );

    while (option && optionRect.y - listY < pageY) {
      option = getOptionAfter(option.data);
      optionRect = option?.element.getBoundingClientRect();
    }

    return option ?? getLastOption();
  };

  useEffect(() => {
    if (listRef.current) {
      const activeElement = optionsRef.current.find(
        (option) => option.data === activeState
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
    openKey,
    activeState,
    setActive,
    selectedState,
    setSelectedState,
    select,
    clear,
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
    getOptionAfter,
    getOptionBefore,
    getOptionPageAbove,
    getOptionPageBelow,
    getFirstOption,
    getLastOption,
    valueToString,
    disabled,
  };
}

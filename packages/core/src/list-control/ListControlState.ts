import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useControlled,
  useEventCallback,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "../utils";
import type { OptionValue } from "./ListControlContext";
import { ListControlOptionStore } from "./ListControlOptionStore";
import {
  createCoalescedRebuild,
  ListControlRegistry,
  type RegisteredOption,
} from "./ListControlRegistry";

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
  return String(item);
}

export function findOptionFromSearch<Item>(
  options: readonly Pick<RegisteredOption<Item>, "data">[],
  search: string,
  valueToString: (item: Item) => string,
  startFrom?: OptionValue<Item>,
): OptionValue<Item> | undefined {
  const collator = new Intl.Collator("en", {
    usage: "search",
    sensitivity: "base",
  });
  const startFromIndex = startFrom
    ? options.findIndex((item) => item.data.value === startFrom.value)
    : -1;
  const startIndex = startFrom ? startFromIndex + 1 : 0;
  const firstIndexByValue = new Map<Item, number>();

  for (let index = 0; index < options.length; index++) {
    const value = options[index].data.value;
    // Strict equality, used by the legacy lookup, never matches NaN.
    if (
      (typeof value !== "number" || !Number.isNaN(value)) &&
      !firstIndexByValue.has(value)
    ) {
      firstIndexByValue.set(value, index);
    }
  }

  const letters = search.split("");
  const allSameLetter =
    letters.length > 0 &&
    letters.every((letter) => collator.compare(letter, letters[0]) === 0);
  let repeatedCharacterMatch: OptionValue<Item> | undefined;

  for (let offset = 0; offset < options.length; offset++) {
    const index = (startIndex + offset) % options.length;
    const option = options[index].data;

    if (firstIndexByValue.get(option.value) !== index) {
      continue;
    }

    const optionText = valueToString(option.value);
    if (
      collator.compare(optionText.substring(0, search.length), search) === 0
    ) {
      return option;
    }

    if (
      repeatedCharacterMatch === undefined &&
      allSameLetter &&
      collator.compare(optionText[0]?.toLowerCase(), letters[0]) === 0
    ) {
      repeatedCharacterMatch = option;
    }
  }

  return repeatedCharacterMatch;
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

  const optionStateStoreRef = useRef<ListControlOptionStore<Item> | null>(null);
  if (optionStateStoreRef.current === null) {
    optionStateStoreRef.current = new ListControlOptionStore(
      selectedProp ?? defaultSelected ?? [],
    );
  }
  const optionStateStore = optionStateStoreRef.current;

  const listRef = useRef<HTMLDivElement>(null);
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const setListRef = useForkRef<HTMLDivElement>(listRef, setListElement);

  const [focusedState, setFocusedState] = useState(false);
  const [focusVisibleState, setFocusVisibleStateInternal] = useState(false);
  const setFocusVisibleState = useCallback((newValue: boolean) => {
    setFocusVisibleStateInternal(newValue);
  }, []);

  useEffect(() => {
    // remove focus when controlling disabled
    if (disabled && focusedState) {
      setFocusedState(false);
      setFocusVisibleState(false);
    }
  }, [disabled, focusedState, setFocusVisibleState]);

  const [activeState, setActiveState] = useState<OptionValue<Item> | undefined>(
    undefined,
  );

  const setActive = useCallback((option?: OptionValue<Item>) => {
    if (option) {
      setActiveState(option);
    } else {
      setActiveState(undefined);
    }
  }, []);

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
    key?: string,
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

  const select = useEventCallback(
    (event: SyntheticEvent, option: OptionValue<Item>) => {
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
    },
  );

  const clear = (event: SyntheticEvent) => {
    setSelectedState([]);
    if (selectedState.length !== 0) {
      onSelectionChange?.(event, []);
    }
  };

  const registryRef = useRef<ListControlRegistry<Item> | null>(null);
  if (registryRef.current === null) {
    registryRef.current = new ListControlRegistry<Item>();
  }
  const registry = registryRef.current;

  useIsomorphicLayoutEffect(() => {
    optionStateStore.setActiveId(activeState?.id);
  }, [activeState?.id, optionStateStore]);

  useIsomorphicLayoutEffect(() => {
    optionStateStore.setFocusVisible(focusVisibleState);
  }, [focusVisibleState, optionStateStore]);

  useIsomorphicLayoutEffect(() => {
    optionStateStore.setSelected(selectedState);
  }, [optionStateStore, selectedState]);

  const register = useCallback(
    (optionValue: OptionValue<Item>, element: HTMLElement) => {
      const unregisterOptionState = optionStateStore.register(optionValue);
      const unregisterRegistry = registry.register(optionValue, element);
      return () => {
        unregisterRegistry();
        unregisterOptionState();
      };
    },
    [optionStateStore, registry],
  );

  useEffect(() => {
    if (!listElement) return;
    const rebuild = () => registry.rebuild(listElement);
    const coalescedRebuild = createCoalescedRebuild(rebuild);
    const mutationObserver = new MutationObserver(coalescedRebuild.schedule);
    mutationObserver.observe(listElement, {
      childList: true,
      subtree: true,
    });

    rebuild();

    return () => {
      coalescedRebuild.cancel();
      mutationObserver.disconnect();
    };
  }, [listElement, registry]);

  const getOptionAtIndex = useCallback(
    (
      index: number,
    ): { data: OptionValue<Item>; element: HTMLElement } | undefined => {
      return registry.getAt(index);
    },
    [registry],
  );

  const getIndexOfOption = useCallback(
    (option: OptionValue<Item>) => {
      return registry.indexOfValue(option.value);
    },
    [registry],
  );

  const getOptionsMatching = useCallback(
    (predicate: (option: OptionValue<Item>) => boolean) => {
      return registry.matching(predicate);
    },
    [registry],
  );

  const getOptionFromSearch = useCallback(
    (search: string, startFrom?: OptionValue<Item>) => {
      return findOptionFromSearch(
        registry.snapshot(),
        search,
        valueToString,
        startFrom,
      );
    },
    [registry, valueToString],
  );

  const getFirstOption = useCallback(() => {
    return getOptionAtIndex(0);
  }, [getOptionAtIndex]);

  const getLastOption = useCallback(() => {
    return getOptionAtIndex(registry.length - 1);
  }, [getOptionAtIndex, registry]);

  const getOptionBefore = useCallback(
    (option: OptionValue<Item>) => {
      const index = registry.indexOfId(option.id);
      return getOptionAtIndex(index - 1);
    },
    [getOptionAtIndex, registry],
  );

  const getOptionAfter = useCallback(
    (option: OptionValue<Item>) => {
      const index = registry.indexOfId(option.id);
      return getOptionAtIndex(index + 1);
    },
    [getOptionAtIndex, registry],
  );

  const getOptionPageAbove = useCallback(
    (start: OptionValue<Item>) => {
      const list = listRef.current;
      let option = registry.findByData(start);

      if (!list || !option) {
        return undefined;
      }

      const containerRect = list.getBoundingClientRect();
      let optionRect: DOMRect | undefined =
        option.element.getBoundingClientRect();

      const listY = containerRect.y - list.scrollTop;
      const pageY = Math.max(
        0,
        optionRect.y - listY + optionRect.height - containerRect.height,
      );

      while (option && optionRect && optionRect.y - listY > pageY) {
        option = getOptionBefore(option.data);
        optionRect = option?.element?.getBoundingClientRect();
      }

      return option ?? getFirstOption();
    },
    [getFirstOption, getOptionBefore, registry],
  );

  const getOptionPageBelow = useCallback(
    (start: OptionValue<Item>) => {
      const list = listRef.current;
      let option = registry.findByData(start);

      if (!list || !option) {
        return undefined;
      }

      const containerRect = list.getBoundingClientRect();
      let optionRect: DOMRect | undefined =
        option.element.getBoundingClientRect();

      const listY = containerRect.y - list.scrollTop;
      const pageY = Math.min(
        list.scrollHeight,
        optionRect.y - listY - optionRect.height + containerRect.height,
      );

      while (option && optionRect && optionRect.y - listY < pageY) {
        option = getOptionAfter(option.data);
        optionRect = option?.element.getBoundingClientRect();
      }

      return option ?? getLastOption();
    },
    [getLastOption, getOptionAfter, registry],
  );

  useEffect(() => {
    if (listRef.current) {
      const activeElement = activeState
        ? registry.findByData(activeState)?.element
        : undefined;

      if (!activeElement) {
        return;
      }

      activeElement.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeState, registry]);

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
    setListRef,
    listRef,
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
    optionStateStore,
  };
}

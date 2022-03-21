import { useIsomorphicLayoutEffect } from "@brandname/core";
import { useCallback, useReducer } from "react";
import {
  ElementRef,
  ManagedItem,
  orientationType,
  overflowAction,
  overflowDispatch,
} from "./overflowTypes";
import { measureChildNodes } from "./overflowUtils";

type reducerType = (
  state: ManagedItem[],
  action: overflowAction
) => ManagedItem[];

const overflowReducer: reducerType = (state, action) => {
  switch (action.type) {
    case "init":
      return action.managedItems ?? state;
    case "remove":
      return removeItem(state, action);
    case "overflow":
      return overflowItem(state, action);
    case "set-priority":
    case "collapse":
      return collapseItem(state, action);
    case "uncollapse":
      return uncollapseItem(state, action);
    default:
      return state;
  }
};

export const collapseItem: reducerType = (
  state,
  { managedItem, managedItems }
) => {
  return managedItem
    ? state.map((item) => {
        if (item.index === managedItem.index) {
          return managedItem;
        } else {
          return item;
        }
      })
    : managedItems
    ? state.map((item) => {
        const targetItem = managedItems.find((i) => i.index === item.index);
        return targetItem || item;
      })
    : state;
};

const overflowItem: reducerType = (state, { managedItem, managedItems }) => {
  if (managedItem?.isOverflowIndicator) {
    return state.concat(managedItem);
  } else if (managedItems) {
    // We get a new item when the overflowIndicator is injected
    const newItems = managedItems.filter(
      (i) => state.find((item) => item.index === i.index) === undefined
    );
    return state
      .map((item) => managedItems.find((i) => i.index === item.index) || item)
      .concat(newItems);
  } else {
    // never happens
    return state;
  }
};

const removeItem: reducerType = (state, action) => {
  return state.filter((item) => item !== action.managedItem);
};

const uncollapseItem: reducerType = (
  managedItems,
  { managedItems: targetItems }
) => {
  return targetItems && targetItems.length
    ? managedItems.map((item) => {
        const managedItem = targetItems.find((i) => i.index === item.index);
        return managedItem || item;
      })
    : managedItems;
};

export const useManagedItems = (
  ref: ElementRef,
  orientation: orientationType
): {
  dispatchOverflowAction: overflowDispatch;
  managedItems: ManagedItem[];
} => {
  const [managedItems, dispatch] = useReducer(overflowReducer, []);

  const measureManagedItems = useCallback(() => {
    const dimension = orientation === "horizontal" ? "width" : "height";
    dispatchOverflowAction({
      type: "init",
      managedItems: measureChildNodes(ref, dimension),
    });
  }, [orientation]);

  const dispatchOverflowAction = useCallback<overflowDispatch>(
    (action) => {
      if (action.type === "reset") {
        measureManagedItems();
      } else {
        dispatch(action);
      }
    },
    [measureManagedItems]
  );

  useIsomorphicLayoutEffect(() => {
    async function measure() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { fonts } = document as any;
      if (fonts) {
        await fonts.ready;
      }
      if (ref.current !== null) {
        measureManagedItems();
      }
    }
    measure();
  }, [measureManagedItems]);

  return {
    dispatchOverflowAction,
    managedItems,
  };
};

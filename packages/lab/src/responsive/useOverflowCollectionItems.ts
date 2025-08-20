import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useReducer,
  useRef,
} from "react";

import {
  type OverflowAction,
  type OverflowReducer,
  type OverflowReducerInitialisationProps,
  overflowReducer,
  reducerInitialiser,
} from "./OverflowReducer";
import type {
  OverflowCollectionHookProps,
  OverflowCollectionHookResult,
  OverflowCollectionOptions,
  OverflowItem,
  OverflowSource,
} from "./overflowTypes";
import { measureOverflowItems } from "./overflowUtils";

const defaultOptions: OverflowCollectionOptions = {};

type WithLabel = { label?: string };

const defaultChildIdentity = (children: ReactNode) => {
  const childLabels: string[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      childLabels.push((child as ReactElement<WithLabel>).props.label ?? "");
    }
  });
  return `${childLabels.length}:${childLabels.join(":")}`;
};

const defaultSourceIdentity = (source: WithLabel[]): string => {
  const labels = source.map(({ label }) => label).join(":");
  return `${source.length}:${labels}`;
};
// We need to track structural changes to controlled source or child elements.
// Simple identity won't work as child elements will be different on every render.
// structural changes are addition or removal of items, reordering items.
// Question, what if user changes prop in declarative TabPanel ?
const getItemsIdentity = (
  defaultSource?: OverflowSource[],
  source?: OverflowSource[],
  children?: ReactNode,
): string => {
  let identity: string;
  if (Array.isArray(defaultSource)) {
    identity = defaultSourceIdentity(defaultSource);
  } else if (Array.isArray(source)) {
    identity = defaultSourceIdentity(source);
  } else {
    identity = defaultChildIdentity(children);
  }
  return identity;
};

type OverflowCollectionHook = (
  props: OverflowCollectionHookProps,
) => OverflowCollectionHookResult;

export const useOverflowCollectionItems: OverflowCollectionHook = ({
  children,
  defaultSource,
  id: idRoot,
  injectedItems = [],
  options = defaultOptions,
  orientation,
  label: _label = "",
  source,
}) => {
  const dataRef = useRef<OverflowItem[]>([]);
  const versionRef = useRef(0);
  const measureTimeout = useRef<number | null>(null);
  const previousIdentityRef = useRef("");
  const fontsLoaded = useRef(false);
  const identity = getItemsIdentity(defaultSource, source, children);
  const isControlled = Array.isArray(source) || Children.count(children) > 0;
  if (isControlled && defaultSource !== undefined) {
    throw Error(
      "useOverflowCollectionItems: defaultSource prop should not be used in combination with either source prop or children ",
    );
  }

  const [data, dispatch] = useReducer<
    OverflowReducer,
    OverflowReducerInitialisationProps
  >(
    overflowReducer,
    {
      children,
      source: source || defaultSource,
      injectedItems,
      idRoot,
      options,
    },
    reducerInitialiser,
  );

  dataRef.current = data;

  const measureManagedItems = useCallback(
    (defer = false) => {
      if (measureTimeout.current) {
        window.clearTimeout(measureTimeout.current);
        measureTimeout.current = null;
      }
      if (defer) {
        measureTimeout.current = window.setTimeout(measureManagedItems, 30);
      } else {
        // If fonts have not yet loaded, measurements WILL be incorrect
        if (fontsLoaded.current) {
          const dimension = orientation === "horizontal" ? "width" : "height";
          const overflowItems = measureOverflowItems(
            dataRef.current,
            dimension,
          );
          // TODO if measurements have not changed, do nothing
          // Track the generation of measured items. This can be used to trigger
          // side effects when measurement takes place.
          versionRef.current += 1;
          dispatch({
            type: "init",
            overflowItems,
          });
        }
      }
    },
    [orientation],
  );

  // Take the initial measurements of overflow items. All subsequent re-measurement will be
  // triggered by either manipulation of the items or item state or updated source.
  useIsomorphicLayoutEffect(() => {
    async function measure(): Promise<void> {
      const { fonts } = document;
      if (fonts) {
        await fonts.ready;
        fontsLoaded.current = true;
      } else {
        fontsLoaded.current = true;
      }
      measureManagedItems();
    }

    measure().catch((err) => {
      console.warn("error occurred measuring Overflow Items", err);
    });
  }, [measureManagedItems]);

  const dispatchOverflowAction = useCallback(
    (action: OverflowAction | { type: "reset" }) => {
      if (action.type === "reset") {
        measureManagedItems();
      } else {
        dispatch(action);

        if (action.type.endsWith("overflow-indicator")) {
          measureManagedItems(true);
        }
      }
    },
    [measureManagedItems],
  );

  useIsomorphicLayoutEffect(() => {
    if (previousIdentityRef.current !== "") {
      const overflowItems = reducerInitialiser({
        children,
        source: source || defaultSource,
        injectedItems,
        idRoot,
        options,
      });

      dispatch({ type: "init", overflowItems });
      measureManagedItems(true);
    }
    previousIdentityRef.current = identity;
  }, [identity]);

  return {
    data,
    dispatch: dispatchOverflowAction,
    isControlled,
    version: versionRef.current,
  };
};

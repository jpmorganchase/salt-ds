import { useIsomorphicLayoutEffect } from "@salt-ds/core";
// Copied from https://gist.github.com/ryanflorence/10e9387f633f9d2e6f444a9bddaabf6e
import {
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
  createContext,
  useRef,
  useState,
} from "react";

// //////////////////////////////////////////////////////////////////////////////
// SUPER HACKS AHEAD: The React team will hate this enough to hopefully give us
// a way to know the index of a descendant given a parent (will help generate
// IDs for accessibility a long with the ability create maximally composable
// component abstractions).
//
// This is all to avoid cloneElement. If we can avoid cloneElement then people
// can have arbitrary markup around MenuItems.  This basically takes advantage
// of react's render lifecycles to let us "register" descendants to an
// ancestor, so that we can track all the descendants and manage focus on them,
// etc.  The super hacks here are for the child to know it's index as well, so
// that it can set attributes, match against state from above, etc.
interface DescendantProviderProps {
  children?: ReactNode;
  items: Record<string, any>[];
  setItems: Dispatch<SetStateAction<Record<string, any>[]>>;
}

interface DescendantContextType {
  assigning?: MutableRefObject<boolean>;
  setItems?: DescendantProviderProps["setItems"];
}
export const DescendantContext = createContext<DescendantContextType>({});

export function DescendantProvider({
  items,
  setItems,
  ...props
}: DescendantProviderProps) {
  // On the first render we say we're "assigning", and the children will push
  // into the array when they show up in their own useLayoutEffect.
  const assigning = useRef(true);

  // since children are pushed into the array in useLayoutEffect of the child,
  // children can't read their index on first render.  So we need to cause a
  // second render so they can read their index.
  const [, forceUpdate] = useState<unknown>();

  // parent useLayoutEffect is always last
  useIsomorphicLayoutEffect(() => {
    if (assigning.current) {
      // At this point all of the children have pushed into the array so we set
      // assigning to false and force an update. Since we're in
      // useLayoutEffect, we won't get a flash of rendered content, it will all
      // happen synchronously. And now that this is false, children won't push
      // into the array on the forceUpdate
      assigning.current = false;
      forceUpdate({});
    } else {
      // After the forceUpdate completes, we end up here and set assigning back
      // to true for the next update from the app
      assigning.current = true;
    }
    return () => {
      // this cleanup function runs right before the next render, so it's the
      // right time to empty out the array to be reassigned with whatever shows
      // up next render.
      if (assigning.current) {
        // we only want to empty out the array before the next render cycle if
        // it was NOT the result of our forceUpdate, so being guarded behind
        // assigning.current works
        setItems([]);
      }
    };
  }, [items]);

  return (
    <DescendantContext.Provider {...props} value={{ setItems, assigning }} />
  );
}

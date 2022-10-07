import { useReducer, useRef, useCallback, useMemo } from "react";

export type refsManager = {
  get: (key: string) => HTMLElement | undefined;
  set: (key: string, ref: HTMLElement) => void;
  values: () => HTMLElement[];
};

export function useRefsManager(): refsManager {
  const refs = useRef(new Map<string, HTMLElement>());
  const [, forceUpdate] = useReducer((x) => !x, false);

  const get = useCallback((key) => refs.current.get(key), []);

  const set = useCallback((key, value) => {
    refs.current.set(key, value);
    forceUpdate();
  }, []);

  const values = useCallback(() => {
    const values: HTMLElement[] = [];
    refs.current.forEach((value) => values.push(value));
    return values;
  }, []);

  return useMemo(() => ({ get, set, values }), [get, set, values]);
}

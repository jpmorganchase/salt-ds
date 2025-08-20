import { useCallback, useMemo, useReducer, useRef } from "react";

export type refsManager = {
  get: (key: string) => HTMLElement | undefined;
  set: (key: string, ref: HTMLElement) => void;
  values: () => HTMLElement[];
};

export function useRefsManager(): refsManager {
  const refs = useRef(new Map<string, HTMLElement>());
  const [, forceUpdate] = useReducer((x) => !x, false);

  const get = useCallback((key: string) => refs.current.get(key), []);

  const set = useCallback((key: string, value: HTMLElement) => {
    refs.current.set(key, value);
    forceUpdate();
  }, []);

  const values = useCallback(() => {
    const vals: HTMLElement[] = [];
    for (const value of refs.current.values()) {
      vals.push(value);
    }
    return vals;
  }, []);

  return useMemo(() => ({ get, set, values }), [get, set, values]);
}

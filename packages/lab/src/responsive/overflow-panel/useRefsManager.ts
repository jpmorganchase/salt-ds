import { useReducer, useRef, useCallback, useMemo } from "react";

export default function useRefsManager() {
  const refs = useRef(new Map());
  const [, forceUpdate] = useReducer((x) => !x, false);

  const get = useCallback((key) => refs.current.get(key), []);

  const set = useCallback((key: string, value: HTMLElement) => {
    refs.current.set(key, value);
    forceUpdate();
  }, []);

  const values: () => HTMLElement[] = useCallback(() => {
    const vals: HTMLElement[] = [];
    refs.current.forEach((value) => vals.push(value));
    return vals;
  }, []);

  return useMemo(() => ({ get, set, values }), [get, set, values]);
}

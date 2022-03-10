import { ValueStream } from "./ValueStream";
import { useEffect, useState } from "react";

type Replacement<T> = T | ((old: T) => T);

export const scrollBarSize = 15;

export function replaceItem<T>(
  source: T[],
  index: number,
  replacement: Replacement<T>
): T[] {
  return [
    ...source.slice(0, index),
    replacement instanceof Function ? replacement(source[index]) : replacement,
    ...source.slice(index + 1),
  ];
}

export function useObservable<T>(source$: ValueStream<T>): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => {
    return source$.getCurrent();
  });
  useEffect(() => {
    return source$.listen(setValue);
  }, []);
  return value!;
}

export const createHook =
  <T>(x: ValueStream<T>) =>
  () =>
    useObservable(x);

export const createHandler =
  <T>(x: ValueStream<T>) =>
  (v: T) =>
    x.push(v);

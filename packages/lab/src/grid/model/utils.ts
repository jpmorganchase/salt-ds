import { BehaviorSubject, distinctUntilChanged, scan, Subject } from "rxjs";
import { useObservable } from "./useObservable";
import { useRef } from "react";

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

export type Pair<T> = [T, T];

export function prevNextPairs<T>() {
  return scan(
    (acc: Pair<T | undefined>, value: T | undefined) => {
      return [acc[1], value] as Pair<T | undefined>;
    },
    [undefined, undefined] as Pair<T | undefined>
  );
}

export function getGridRoot(element: HTMLElement): HTMLDivElement {
  if (!element) {
    throw new Error(`Grid root not found`);
  }
  if (element.hasAttribute("data-name")) {
    if (element.getAttribute("data-name") === "grid-root") {
      return element as HTMLDivElement;
    }
  }
  return getGridRoot(element.parentNode as HTMLElement);
}

// Helper functions to expose subjects as event handlers or hooks
export const createHook =
  <T>(bs: BehaviorSubject<T>) =>
  () =>
    useObservable(bs);

export const createHandler = <T>(s: Subject<T>) => {
  const distinctSubject = new Subject<T>();
  distinctSubject.pipe(distinctUntilChanged()).subscribe((x) => s.next(x));
  return (v: T) => distinctSubject.next(v);
};

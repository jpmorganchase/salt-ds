import { useState, useRef, useEffect, useCallback, RefCallback } from "react";

type OnTruncatedCallback = (isTruncated: boolean) => void;
export type GetOverflowRef = (index: number) => RefCallback<HTMLElement>;

/**
 * Hook to detect truncation of any child TrackerStep components, using a ResizeObserver to update on element resizes.
 * @param {OnTruncatedCallback} callback - The callback which will called when the isTruncated state changes
 * @returns {GetOverflowRef} getOverflowRef - A factory function which when passed a child index will return an appropriate ref callback for observing am element
 */
const useDetectTruncatedText = (
  callback: OnTruncatedCallback
): GetOverflowRef => {
  // Used for tracking creation/destruction of child elements
  const [observedMap] = useState(() => new Map<number, HTMLElement>());

  // Store callback as a ref to prevent re-creating ResizeObserver, update using an effect
  const callbackRef = useRef<(isOverflowing: boolean) => void>(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Creation of the ResizeObserver, should only happen once
  const getRo = useCallback(() => {
    let isTruncated = false;

    const observer = new ResizeObserver((entries) => {
      let anyEntriesTruncated = false;

      for (const entry of entries) {
        const entryElem = entry.target as HTMLElement;

        // We only care about whether one of the elements is truncated  so can break after
        if (entryElem.offsetWidth < entryElem.scrollWidth) {
          anyEntriesTruncated = true;
          break;
        }
      }

      if (anyEntriesTruncated !== isTruncated) {
        isTruncated = anyEntriesTruncated;
        callbackRef.current(anyEntriesTruncated);
      }
    });

    return observer;
  }, []);

  // Management of the ResizeObserver lifecycle. It should only be created once for each StepTracker compoenent
  const [ro, setRo] = useState(() => getRo());

  useEffect(() => {
    return () => {
      ro.disconnect();
    };
  }, [ro]);

  useEffect(() => {
    setRo(getRo());
  }, [getRo]);

  // Function for managing the observing/unobserving of elements based on their ref callbacks
  const observeAndUnobserveRef = useCallback(
    (i: number, el: HTMLElement | null) => {
      if (!el) {
        const existingRef = observedMap.get(i);
        if (existingRef) {
          ro.unobserve(existingRef);
          observedMap.delete(i);
        }
      } else {
        const existingRef = observedMap.get(i);
        if (el === existingRef) {
          return;
        }

        if (existingRef) {
          ro.unobserve(existingRef);
        }
        observedMap.set(i, el);

        ro.observe(el);
      }
    },
    [observedMap, ro]
  );

  // Factory function which creates a suitable html ref callback which includes the index
  const getOverflowRef = useCallback<GetOverflowRef>(
    (i: number) => {
      return (el: HTMLElement | null) => {
        observeAndUnobserveRef(i, el);
      };
    },
    [observeAndUnobserveRef]
  );

  return getOverflowRef;
};

export default useDetectTruncatedText;

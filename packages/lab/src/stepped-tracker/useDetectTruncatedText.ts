import { useState, useRef, useEffect, useCallback, RefCallback } from "react";

type OnTruncatedCallback = (isTruncated: boolean) => void;
export type GetOverflowRef = (id: string) => RefCallback<HTMLElement>;

/**
 * Hook to detect truncation of any child TrackerStep components, using a ResizeObserver to update on element resizes.
 * The desired behaviour is whenever any of the individual steps is truncated, all steps become foccusable with Tooltips.
 * @param {OnTruncatedCallback} callback - The callback which will called when the isTruncated state changes
 * @returns {GetOverflowRef} getOverflowRef - A factory function which when passed a child index will return an appropriate ref callback for observing am element
 */
const useDetectTruncatedText = (
  callback: OnTruncatedCallback
): GetOverflowRef => {
  // Used for tracking creation/destruction of child elements
  const [observedMap] = useState(() => new Map<string, HTMLElement>());

  // Store callback as a ref to prevent re-creating ResizeObserver, update using an effect
  const callbackRef = useRef<(isOverflowing: boolean) => void>(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  const isTruncatedRef = useRef(false);

  const checkEntries = useCallback(() => {
    let anyEntriesTruncated = false;

    observedMap.forEach((entry) => {
      if (!anyEntriesTruncated) {
        if (entry.offsetWidth < entry.scrollWidth) {
          anyEntriesTruncated = true;
        }
      }
    });

    if (anyEntriesTruncated !== isTruncatedRef.current) {
      isTruncatedRef.current = anyEntriesTruncated;
      callbackRef.current(anyEntriesTruncated);
    }
  }, [observedMap]);

  // Creation of the ResizeObserver, should only happen once
  const getRo = useCallback(() => {
    return new ResizeObserver(checkEntries);
  }, [checkEntries]);

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
    (id: string, el: HTMLElement | null) => {
      if (!el) {
        const existingRef = observedMap.get(id);
        if (existingRef) {
          ro.unobserve(existingRef);
          observedMap.delete(id);
        }
      } else {
        const existingRef = observedMap.get(id);
        if (el === existingRef) {
          return;
        }

        if (existingRef) {
          ro.unobserve(existingRef);
        }

        observedMap.set(id, el);
        ro.observe(el);
        checkEntries();
      }
    },
    [observedMap, ro, checkEntries]
  );

  // Factory function which creates a suitable html ref callback which includes the index
  const getOverflowRef = useCallback<GetOverflowRef>(
    (id: string) => {
      return (el: HTMLElement | null) => {
        observeAndUnobserveRef(id, el);
      };
    },
    [observeAndUnobserveRef]
  );

  return getOverflowRef;
};

export default useDetectTruncatedText;

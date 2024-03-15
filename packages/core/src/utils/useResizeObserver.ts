import {useEffect, RefObject} from "react";
import {ownerWindow} from "./ownerWindow";

export interface UseResizeObserverProps {
  ref: RefObject<HTMLElement>;
  onResize: () => void;
}

export function useResizeObserver({ ref, onResize }: UseResizeObserverProps){

  useEffect(() => {
    const element = ref?.current;
    if(!element) return;

    const win = ownerWindow(element);

    const resizeObserver = new win.ResizeObserver((entries) => {
      if(entries.length === 0) return;

      onResize();
    });
    resizeObserver.observe(element);

    return () => {
      if(element) {
        resizeObserver.unobserve(element);
      }
    }

  }, [ref, onResize]);

}

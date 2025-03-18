import { createContext } from "@salt-ds/core";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import {
  carouselReducer,
  type CarouselReducerDispatch,
  type CarouselReducerState,
} from "./CarouselReducer";

export const CarouselStateContext = createContext<CarouselReducerState>(
  "CarouselStateContext",
  {
    slides: new Map(),
    firstVisibleSlideIndex: 0,
    visibleSlides: 1,
    containerRef: null,
    carouselId: undefined,
  },
);
export const CarouselDispatchContext = createContext<CarouselReducerDispatch>(
  "CarouselDispatchContext",
  () => {
    return;
  },
);

export function CarouselProvider({
  children,
  firstVisibleSlideIndex = 0,
  visibleSlides = 1,
  id,
}: {
  children: ReactNode;
  firstVisibleSlideIndex?: number;
  visibleSlides?: number;
  id?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(carouselReducer, {
    slides: new Map(),
    firstVisibleSlideIndex,
    visibleSlides,
    containerRef,
    carouselId: id,
  });

  useEffect(() => {
    dispatch({ type: "updateSlideCount", payload: visibleSlides });
  }, [visibleSlides]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({
        left: firstVisibleSlideIndex * (container.offsetWidth / visibleSlides),
        // @ts-ignore instant scroll
        behavior: "instant",
      });
    });
  }, [firstVisibleSlideIndex, visibleSlides]);

  return (
    <CarouselStateContext.Provider value={state}>
      <CarouselDispatchContext.Provider value={dispatch}>
        {children}
      </CarouselDispatchContext.Provider>
    </CarouselStateContext.Provider>
  );
}

import { createContext } from "@salt-ds/core";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import {
  type CarouselReducerDispatch,
  type CarouselReducerState,
  carouselReducer,
} from "./CarouselReducer";

export const CarouselStateContext = createContext<CarouselReducerState>(
  "CarouselStateContext",
  {
    slides: new Map(),
    firstVisibleSlideIndex: 0,
    visibleSlides: 1,
    focusedSlideIndex: undefined,
    containerRef: null,
    carouselId: undefined,
    activeHeading: "",
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
    activeHeading: "",
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

import { createContext } from "@salt-ds/core";
import {
  type ReactNode,
  type RefObject,
  useContext,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import {
  type CarouselReducerDispatch,
  type CarouselReducerState,
  carouselReducer,
} from "./CarouselReducer";

export interface CarouselContextValue {
  containerRef: RefObject<HTMLDivElement>;
  carouselId?: string;
}

export const CarouselContext = createContext<CarouselContextValue | null>(
  "CarouselContext",
  null,
);

export const CarouselStateContext = createContext<CarouselReducerState>(
  "CarouselStateContext",
  { slides: new Map(), firstVisibleSlide: 0, visibleSlides: 1 },
);
export const CarouselDispatchContext = createContext<CarouselReducerDispatch>(
  "CarouselDispatchContext",
  () => {
    return;
  },
);

export function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within CarouselProvider");
  }
  return context;
}

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
    firstVisibleSlide: firstVisibleSlideIndex,
    visibleSlides,
  });

  const slides = useRef<
    Map<string, { element: HTMLDivElement; index: number }>
  >(new Map());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({
        left: firstVisibleSlideIndex * (container.offsetWidth / visibleSlides),
        behavior: "instant",
      });
    });
  }, [firstVisibleSlideIndex, visibleSlides]);

  return (
    <CarouselStateContext.Provider value={state}>
      <CarouselDispatchContext.Provider value={dispatch}>
        <CarouselContext.Provider
          value={{
            containerRef,
            carouselId: id,
          }}
        >
          {children}
        </CarouselContext.Provider>
      </CarouselDispatchContext.Provider>
    </CarouselStateContext.Provider>
  );
}

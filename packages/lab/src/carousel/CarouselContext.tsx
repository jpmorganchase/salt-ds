import { createContext } from "@salt-ds/core";
import {
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  carouselReducer,
  CarouselReducerDispatch,
  CarouselReducerState,
} from "./CarouselReducer";

export interface CarouselContextValue {
  firstVisibleSlide: number;
  visibleSlides: number;
  slideCount: number;
  nextSlide: (moveFocus?: boolean) => void;
  prevSlide: (moveFocus?: boolean) => void;
  containerRef: RefObject<HTMLDivElement>;
  carouselId?: string;
  getSlideRef?: (index: number) => HTMLDivElement;
}

export const CarouselContext = createContext<CarouselContextValue | null>(
  "CarouselContext",
  null,
);

export const CarouselStateContext = createContext<CarouselReducerState>(
  "CarouselStateContext",
  { slides: new Map() },
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
  const [state, dispatch] = useReducer(carouselReducer, { slides: new Map() });

  const [firstVisibleSlide, setFirstVisibleSlide] = useState(
    firstVisibleSlideIndex,
  );
  const slides = useRef<
    Map<string, { element: HTMLDivElement; index: number }>
  >(new Map());
  const [slideCount, setSlideCount] = useState(slides.current.size);

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

  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = (moveFocus = false) => {
    const container = containerRef.current;
    if (!container || firstVisibleSlide >= slideCount - 1) return;

    const nextIndex = firstVisibleSlide + 1;
    const slideWidth = container.offsetWidth / visibleSlides;
    containerRef.current.scrollBy({
      left: slideWidth,
      behavior: "smooth",
    });
    setFirstVisibleSlide(nextIndex);
    if (moveFocus) {
      const focusTargetIndex = Math.min(nextIndex, slideCount - 1);
      getSlideRef(focusTargetIndex)?.focus();
    }
  };

  const prevSlide = (moveFocus = false) => {
    const container = containerRef.current;
    if (!container || firstVisibleSlide <= 0) return;
    const prevIndex = firstVisibleSlide - 1;
    const slideWidth = container.offsetWidth / visibleSlides;
    containerRef.current.scrollBy({
      left: -slideWidth,
      behavior: "smooth",
    });
    setFirstVisibleSlide(prevIndex);
    if (moveFocus) {
      getSlideRef(prevIndex)?.focus();
    }
  };

  const getSlideRef = useCallback((index: number) => {
    const slideEntries = [...slides.current.values()];
    return slideEntries[index]?.element ?? null;
  }, []);

  useEffect(() => {
    console.log({ state });
  }, [state]);
  return (
    <CarouselStateContext.Provider value={state}>
      <CarouselDispatchContext.Provider value={dispatch}>
        <CarouselContext.Provider
          value={{
            visibleSlides,
            slideCount,
            firstVisibleSlide,
            nextSlide,
            prevSlide,
            containerRef,
            carouselId: id,
            getSlideRef,
          }}
        >
          {children}
        </CarouselContext.Provider>
      </CarouselDispatchContext.Provider>
    </CarouselStateContext.Provider>
  );
}

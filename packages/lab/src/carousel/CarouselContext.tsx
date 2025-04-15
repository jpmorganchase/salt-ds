import { createContext, useControlled } from "@salt-ds/core";
import { type ReactNode, useEffect, useReducer } from "react";
import {
  type CarouselReducerDispatch,
  type CarouselReducerState,
  carouselReducer,
} from "./CarouselReducer";

export const CarouselStateContext = createContext<CarouselReducerState>(
  "CarouselStateContext",
  {
    slides: new Map(),
    activeSlideIndex: 0,
    visibleSlides: 1,
    focusedSlideIndex: 0,
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
  activeSlideIndex: activeSlideIndexProp,
  defaultActiveSlideIndex = 0,
  visibleSlides = 1,
  id,
}: {
  children: ReactNode;
  activeSlideIndex?: number;
  defaultActiveSlideIndex?: number;
  visibleSlides?: number;
  id?: string;
}) {
  const [activeSlideIndex, setActiveSlideIndex] = useControlled({
    controlled: activeSlideIndexProp,
    default: defaultActiveSlideIndex,
    name: "Carousel",
    state: "activeSlideIndex",
  });
  const [state, dispatch] = useReducer(carouselReducer, {
    slides: new Map(),
    focusedSlideIndex: activeSlideIndex,
    activeSlideIndex,
    visibleSlides,
    carouselId: id,
  });

  useEffect(() => {
    dispatch({
      type: "updateSlideCount",
      payload: visibleSlides,
    });
  }, [visibleSlides]);

  useEffect(() => {
    dispatch({
      type: "moveToIndex",
      payload: activeSlideIndex,
    });
  }, [activeSlideIndex]);

  return (
    <CarouselStateContext.Provider value={state}>
      <CarouselDispatchContext.Provider value={dispatch}>
        {children}
      </CarouselDispatchContext.Provider>
    </CarouselStateContext.Provider>
  );
}

import { createContext } from "@salt-ds/core";
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
    firstVisibleSlideIndex: 0,
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
  firstVisibleSlideIndex = 0,
  visibleSlides = 1,
  id,
}: {
  children: ReactNode;
  firstVisibleSlideIndex?: number;
  visibleSlides?: number;
  id?: string;
}) {
  const [state, dispatch] = useReducer(carouselReducer, {
    slides: new Map(),
    focusedSlideIndex: firstVisibleSlideIndex,
    firstVisibleSlideIndex,
    visibleSlides,
    carouselId: id,
  });

  useEffect(() => {
    dispatch({
      type: "updateSlideCount",
      payload: visibleSlides,
    });
  }, [visibleSlides]);

  return (
    <CarouselStateContext.Provider value={state}>
      <CarouselDispatchContext.Provider value={dispatch}>
        {children}
      </CarouselDispatchContext.Provider>
    </CarouselStateContext.Provider>
  );
}

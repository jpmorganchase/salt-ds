import type { Dispatch } from "react";

import type { CarouselSlideElement, CarouselSlideId } from "./CarouselSlide";

export interface CarouselReducerState {
  slides: Map<CarouselSlideId, CarouselSlideElement>;
  firstVisibleSlideIndex: number;
  visibleSlides: number;
  focusedSlideIndex: number;
  carouselId?: string;
}
export type CarouselReducerAction =
  | { type: "register"; payload: [CarouselSlideId, CarouselSlideElement] }
  | { type: "unregister"; payload: CarouselSlideId }
  | { type: "updateSlideCount"; payload: number }
  | { type: "move"; payload: CarouselSlideId }
  | { type: "scroll"; payload: CarouselSlideId };

export type CarouselReducerDispatch = Dispatch<CarouselReducerAction>;

export function carouselReducer(
  state: CarouselReducerState,
  action: CarouselReducerAction,
) {
  switch (action.type) {
    case "register": {
      const { slides } = state;
      const [id, element] = action.payload;
      slides.set(id, element);
      return {
        ...state,
        slides: new Map(slides),
      };
    }
    case "unregister": {
      const { slides } = state;
      const id = action.payload;
      if (!slides.has(id)) return state;
      slides.delete(id);
      return {
        ...state,
        slides: new Map(slides),
      };
    }
    // moves the first visible item
    case "move": {
      const { slides } = state;
      const id = action.payload;
      if (!slides.has(id)) return state;
      const slideIds = [...slides.keys()];
      const index = slideIds.indexOf(id || slideIds[0]);
      return {
        ...state,
        firstVisibleSlideIndex: index,
      };
    }
    case "updateSlideCount": {
      const visibleSlides = action.payload;

      return { ...state, visibleSlides: visibleSlides };
    }

    case "scroll": {
      const id = action.payload;
      const { slides } = state;

      const focusedSlideIndex = [...slides.keys()].indexOf(id);

      if (focusedSlideIndex === -1) return state;

      return {
        ...state,
        focusedSlideIndex,
      };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Action of type ${exhaustiveCheck} does not exist`);
    }
  }
}

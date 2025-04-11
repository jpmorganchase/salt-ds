import type { Dispatch } from "react";

import type { CarouselSlideId, CarouselSlideMeta } from "./CarouselSlide";

export interface CarouselReducerState {
  slides: Map<CarouselSlideId, CarouselSlideMeta>;
  activeSlideIndex: number;
  visibleSlides: number;
  focusedSlideIndex: number;
  carouselId?: string;
}
export type CarouselReducerAction =
  | { type: "register"; payload: [CarouselSlideId, CarouselSlideMeta] }
  | { type: "unregister"; payload: CarouselSlideId }
  | { type: "updateSlideCount"; payload: number }
  | { type: "move"; payload: CarouselSlideId }
  | { type: "moveToIndex"; payload: number }
  | { type: "scroll"; payload: CarouselSlideId };

export type CarouselReducerDispatch = Dispatch<CarouselReducerAction>;

export function carouselReducer(
  state: CarouselReducerState,
  action: CarouselReducerAction,
) {
  switch (action.type) {
    case "register": {
      const { slides } = state;
      const [id, { element, slideDescription }] = action.payload;
      const newSlides = new Map(slides);
      newSlides.set(id, { element, slideDescription });
      return {
        ...state,
        slides: newSlides,
      };
    }
    case "unregister": {
      const { slides } = state;
      const id = action.payload;
      if (!slides.has(id)) {
        return state;
      }
      const newSlides = new Map(slides);
      newSlides.delete(id);
      return {
        ...state,
        slides: newSlides,
      };
    }
    // moves the first visible item
    case "move": {
      const { slides } = state;
      const id = action.payload;
      if (!slides.has(id)) {
        return state;
      }
      const slideIds = [...slides.keys()];
      const index = slideIds.indexOf(id || slideIds[0]);
      return {
        ...state,
        activeSlideIndex: index,
      };
    }
    case "moveToIndex": {
      const { slides } = state;

      const index = action.payload;

      if (index === -1 || index > slides.size) {
        return state;
      }

      return {
        ...state,
        focusedSlideIndex: index,
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

      if (focusedSlideIndex === -1) {
        return state;
      }

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

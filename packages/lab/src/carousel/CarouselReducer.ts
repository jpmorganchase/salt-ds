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
): CarouselReducerState {
  const { slides, activeSlideIndex, focusedSlideIndex } = state;

  switch (action.type) {
    case "register": {
      const [id, slideMeta] = action.payload;
      const newSlides = new Map(slides);
      newSlides.set(id, slideMeta);
      return {
        ...state,
        slides: newSlides,
      };
    }
    case "unregister": {
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

    case "move": {
      const id = action.payload;
      if (!slides.has(id)) {
        return state;
      }
      const slideIds = [...slides.keys()];
      const index = slideIds.indexOf(id);
      return {
        ...state,
        activeSlideIndex: index !== -1 ? index : activeSlideIndex,
      };
    }
    case "moveToIndex": {
      const index = action.payload;
      if (index < 0 || index >= slides.size) {
        return state;
      }

      return {
        ...state,
        focusedSlideIndex: index,
      };
    }
    case "updateSlideCount": {
      const visibleSlides = action.payload;
      return { ...state, visibleSlides };
    }

    case "scroll": {
      const id = action.payload;
      const { slides } = state;

      const index = [...slides.keys()].indexOf(id);
      if (index === -1) {
        return state;
      }

      return {
        ...state,
        focusedSlideIndex: index,
      };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Action of type ${exhaustiveCheck} does not exist`);
    }
  }
}

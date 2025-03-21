import type { Dispatch, RefObject } from "react";

type SlideElement = HTMLDivElement;
type SlideId = string;

export interface CarouselReducerState {
  slides: Map<SlideId, SlideElement>;
  firstVisibleSlideIndex: number;
  visibleSlides: number;
  focusedSlideIndex?: number;
  containerRef: RefObject<HTMLDivElement> | null;
  carouselId?: string;
}
export type CarouselReducerAction =
  | { type: "register"; payload: [SlideId, SlideElement] }
  | { type: "unregister"; payload: SlideId }
  | { type: "updateSlideCount"; payload: number }
  | { type: "move"; payload: SlideId }
  | { type: "scroll"; payload: SlideId }
  | { type: "focus"; payload: SlideId };
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
      const { slides, containerRef, visibleSlides } = state;
      const id = action.payload;
      const container = containerRef?.current;
      if (!container || !slides.has(id)) return state;
      const slideIds = [...slides.keys()];
      const index = slideIds.indexOf(id || slideIds[0]);
      requestAnimationFrame(() => {
        container.scrollTo({
          left: index * (container.offsetWidth / visibleSlides),
          behavior: "smooth",
        });
      });
      return state;
    }
    case "focus": {
      const { slides } = state;
      const id = action.payload;
      slides.get(id)?.focus();
      const slideIds = [...slides.keys()];
      const index = slideIds.indexOf(id || slideIds[0]);
      return { ...state, focusedSlideIndex: index };
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Action of type ${exhaustiveCheck} does not exist`);
    }
  }
}

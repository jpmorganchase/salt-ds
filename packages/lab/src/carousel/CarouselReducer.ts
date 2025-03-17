import type { Dispatch } from "react";

type SlideElement = HTMLDivElement;
type SlideId = string;

export interface CarouselReducerState {
  slides: Map<SlideId, SlideElement>;
  firstVisibleSlideId: SlideId;
  visibleSlides: number;
  // containerRef: RefObject<HTMLDivElement>;
  // carouselId?: string;
}
export type CarouselReducerAction =
  | { type: "register"; payload: [SlideId, SlideElement] }
  | { type: "unregister"; payload: SlideId }
  | { type: "move"; payload: SlideId }
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
      return {
        ...state,
        firstVisibleSlideId: id,
      };
    }
    case "focus": {
      const { slides } = state;
      const id = action.payload;
      slides.get(id)?.focus();
      return state;
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Action of type ${exhaustiveCheck} does not exist`);
    }
  }
}

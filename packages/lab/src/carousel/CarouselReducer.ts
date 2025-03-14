import { Dispatch } from "react";
import { bool, boolean } from "yup";

type SlideElement = HTMLDivElement;
type SlideId = string;

export interface CarouselReducerState {
  slides: Map<SlideId, SlideElement>;
  // firstVisibleSlide: number;
  // visibleSlides: number;
  // containerRef: RefObject<HTMLDivElement>;
  // carouselId?: string;
}
export type CarouselReducerAction =
  | { type: "register"; payload: [SlideId, SlideElement] }
  | { type: "unregister"; payload: SlideId }
  | { type: "next"; payload: boolean };
// | { type: "previous"; payload: MouseEvent | KeyboardEvent }
// | { type: "focus"; payload: number };
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
    case "next": {
      const {} = state;
      if ()

      return {
        ...state,
      };
    }
    case "previous": {
      return {
        ...state,
      };
    }
    case "focus": {
      const { slides } = state;
      const index = action.payload;

      slides.get(index)?.focus();

      return state;
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Action of type ${exhaustiveCheck} does not exist`);
    }
  }
}

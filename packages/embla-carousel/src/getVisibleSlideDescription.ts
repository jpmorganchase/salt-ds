import type { EmblaCarouselType } from "embla-carousel";
import { getSlideDescription } from "./getSlideDescription";
import { getVisibleSlideIndexes } from "./getVisibleSlideIndexes";

/** Get a description of the visible slide(s).
 * @param emblaApi
 * @param slideIndex
 * @returns An array of descriptions for the visible slides
 */
export const getVisibleSlideDescription = (
  emblaApi: EmblaCarouselType | undefined,
  scrollSnapIndex: number,
): string => {
  if (!emblaApi) {
    return "";
  }

  const visibleSlideIndexes = getVisibleSlideIndexes(emblaApi, scrollSnapIndex);
  const numberOfSlides = emblaApi?.slideNodes().length ?? 0;

  if (numberOfSlides < 1) {
    return "";
  }

  if (visibleSlideIndexes.length > 1) {
    return `Slide ${visibleSlideIndexes[0]} to ${visibleSlideIndexes[visibleSlideIndexes.length - 1]} of ${numberOfSlides}`;
  }
  const visibleSlideIndex = visibleSlideIndexes[0];
  const description = getSlideDescription(emblaApi, visibleSlideIndex);
  const slide = emblaApi?.slideNodes()[visibleSlideIndex - 1];
  const slideRoleDescription = slide?.ariaRoleDescription ?? "slide";
  return `${description}, ${slideRoleDescription}, ${visibleSlideIndex} of ${numberOfSlides}`;
};

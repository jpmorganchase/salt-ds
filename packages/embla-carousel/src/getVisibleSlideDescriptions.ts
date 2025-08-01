import type { EmblaCarouselType } from "embla-carousel";
import { getSlideDescription } from "./getSlideDescription";
import { getVisibleSlideIndexes } from "./getVisibleSlideIndexes";

/** Get a description of the visible slide(s) content.
 * @param emblaApi
 * @param slideIndex
 * @returns An array of descriptions for the visible slides
 */
export const getVisibleSlideDescriptions = (
  emblaApi: EmblaCarouselType | undefined,
  scrollSnapIndex: number,
): string[] => {
  if (!emblaApi) {
    return [];
  }

  const visibleSlideIndexes = getVisibleSlideIndexes(emblaApi, scrollSnapIndex);
  const numberOfSlides = emblaApi?.slideNodes().length ?? 0;

  return visibleSlideIndexes.reduce<string[]>((result, slideIndex) => {
    const description = getSlideDescription(emblaApi, slideIndex);
    return [
      ...result,
      `${description}, slide, ${slideIndex} of ${numberOfSlides}` || "",
    ];
  }, []);
};

import type { EmblaCarouselType } from "embla-carousel";

export const getSlideNumberRange = (
  startSlideNumber: number,
  endSlideNumber: number,
): number[] => {
  const slideNumbers: number[] = [];
  for (let i = startSlideNumber; i <= endSlideNumber; i++) {
    slideNumbers.push(i);
  }
  return slideNumbers;
};

/** Get the visible slide indexes
 * @param emblaApi
 * @param scrollSnap
 * @returns An array of visible slide indexes
 */
export const getVisibleSlideIndexes = (
  emblaApi: EmblaCarouselType | undefined,
  scrollSnapIndex: number,
): number[] => {
  if (!emblaApi) {
    return [];
  }

  const numberOfSlides = emblaApi?.slideNodes().length ?? 0;
  const scrollSnaps = emblaApi?.scrollSnapList() ?? [];
  const slidesPerTransition = numberOfSlides
    ? Math.ceil(numberOfSlides / scrollSnaps.length)
    : 0;
  const startSlideNumber = Math.min(
    scrollSnapIndex * slidesPerTransition + 1,
    numberOfSlides - (slidesPerTransition - 1),
  );
  const endSlideNumber = Math.min(
    startSlideNumber + slidesPerTransition - 1,
    numberOfSlides,
  );

  if (startSlideNumber === endSlideNumber) {
    return [startSlideNumber];
  }
  return getSlideNumberRange(startSlideNumber, endSlideNumber);
};

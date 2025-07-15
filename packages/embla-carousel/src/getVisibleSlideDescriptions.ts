import type { EmblaCarouselType } from "embla-carousel";
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

  return visibleSlideIndexes.reduce<string[]>((result, slideIndex) => {
    const slideElement = emblaApi.slideNodes()[slideIndex - 1];
    let description: string | undefined =
      slideElement?.getAttribute("aria-label") ?? undefined;

    if (!description) {
      const labelledById = slideElement?.getAttribute("aria-labelledby");
      const { ownerDocument } = emblaApi.internalEngine();
      if (labelledById) {
        const labelledByElement = ownerDocument.getElementById(labelledById);
        description = labelledByElement?.textContent ?? undefined;
      }
    }

    return [...result, description || ""];
  }, []);
};

import type { EmblaCarouselType } from "embla-carousel";

/** Get a description of the slide.
 * @param emblaApi
 * @param slideIndex
 * @returns A slide description if defined or an empty string
 */
export const getSlideDescription = (
  emblaApi: EmblaCarouselType | undefined,
  slideNumber: number,
): string => {
  if (!emblaApi || slideNumber < 1) {
    return "";
  }

  const slideElement = emblaApi.slideNodes()[slideNumber - 1];
  const { ownerDocument } = emblaApi.internalEngine();

  const resolveAriaLabelledBy = (element: Element | null): string | null => {
    if (!element) return null;

    const labelledById = element.getAttribute("aria-labelledby");
    let description = null;

    if (labelledById) {
      const labelledByElement = ownerDocument.getElementById(labelledById);
      if (labelledByElement) {
        // Recursively resolve aria-labelledby
        description = resolveAriaLabelledBy(labelledByElement);
      }
    }

    // If no description found, use aria-label or text content
    if (!description) {
      description =
        element.getAttribute("aria-label") || element.textContent || null;
    }

    return description;
  };

  let description = resolveAriaLabelledBy(slideElement);

  if (!description) {
    description = slideElement?.getAttribute("aria-label") ?? null;
  }

  return description || "";
};

/**
 * Get a description of a range of slide content.
 * @param emblaApi
 * @param startSlideIndex
 * @param endSlideIndex
 */
export function getSlideDescriptions(
  emblaApi: EmblaCarouselType | undefined,
  startSlideNumber: number,
  endSlideNumber = 0,
) {
  if (
    !emblaApi ||
    startSlideNumber < 0 ||
    endSlideNumber > emblaApi.slideNodes().length
  ) {
    return [""];
  }
  if (endSlideNumber) {
    const slideDescriptions = [];
    for (
      let slideNumber = endSlideNumber;
      slideNumber <= endSlideNumber;
      slideNumber++
    ) {
      slideDescriptions.push(getSlideDescription(emblaApi, slideNumber));
    }
    return slideDescriptions;
  }
  const description = getSlideDescription(emblaApi, startSlideNumber);
  return [description];
}

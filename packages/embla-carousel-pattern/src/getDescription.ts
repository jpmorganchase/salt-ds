/**
 * Type definition for the parameters of the getSlideLabel function.
 */
export type GetSlideLabel = (
  /**
   * The HTML element representing the slide.
   */
  slideElement: HTMLElement,

  /**
   * The index of the slide within the carousel.
   */
  slideIndex: number,

  /**
   * The total number of slides in the carousel.
   */
  slideCount: number,
) => string;

/**
 * Generates a label for a carousel slide based on ARIA attributes.
 *
 * @param props - The properties required to generate the slide description.
 * @returns A string description of the slide, including its position and ARIA label or text content.
 */
export const getSlideLabel: GetSlideLabel = (
  slideElement,
  slideIndex,
  slideCount,
): string => {
  let description = slideElement?.getAttribute("aria-label");
  if (!description) {
    const labelledById = slideElement?.getAttribute("aria-labelledby");
    if (labelledById) {
      const labelledByElement = document.getElementById(labelledById);
      description =
        labelledByElement?.textContent || "No description available";
    } else {
      description = "No description available";
    }
  }
  return `slide ${slideIndex + 1} of ${slideCount}. ${description}`;
};

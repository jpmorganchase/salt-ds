import { useAriaAnnouncer } from "@salt-ds/core";
import type {
  CreateOptionsType,
  CreatePluginType,
  EmblaCarouselType,
} from "embla-carousel";
import { useCallback } from "react";

declare module "embla-carousel" {
  interface EmblaPluginsType {
    announcement: CarouselAnnouncementType;
  }
}

/**
 * Type definition for the parameters of the getSlideLabel function.
 * @returns A string that describes the slide, including its index and total count.
 */
export type GetSlideLabelProps = (
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

/** * Generates a label for a carousel slide based on ARIA attributes.
 * This function retrieves the slide's ARIA label or text content and formats it into a descriptive string.
 * @param slideElement
 * @param slideIndex
 * @param slideCount
 * @returns A string description of the slide, including its position and ARIA label or text content.
 */
export const getSlideLabel: GetSlideLabelProps = (
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

// biome-ignore lint/complexity/noBannedTypes: Replicated from embla docs/code
type OptionsType = CreateOptionsType<{}>;
// biome-ignore lint/complexity/noBannedTypes: Replicated from embla docs/code
export type CarouselAnnouncementType = CreatePluginType<{}, OptionsType>;

export type CarouselAnnouncementOptionsType =
  CarouselAnnouncementType["options"];

export function CarouselAnnouncement(
  userOptions: CarouselAnnouncementOptionsType = {},
): CarouselAnnouncementType {
  let emblaApi: EmblaCarouselType;

  const { announce } = useAriaAnnouncer();

  const handleSettle = useCallback(
    (emblaApi: EmblaCarouselType) => {
      const slideCount = emblaApi?.slideNodes().length ?? 0;
      const slideIndexInView = emblaApi?.slidesInView()?.[0] ?? 0;
      const slideElement = emblaApi?.slideNodes()[slideIndexInView];

      const slideLabel = getSlideLabel(
        slideElement,
        slideIndexInView,
        slideCount,
      );
      announce(slideLabel);
    },
    [announce],
  );

  function init(emblaApiInstance: EmblaCarouselType): void {
    emblaApi = emblaApiInstance;
    emblaApi.on("settle", handleSettle);
  }

  function destroy(): void {
    emblaApi.off("settle", handleSettle);
  }

  const self: CarouselAnnouncementType = {
    name: "announcement",
    options: userOptions,
    init,
    destroy,
  };
  return self;
}

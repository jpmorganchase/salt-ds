import { useAriaAnnouncer } from "@salt-ds/core";
import type {
  CreateOptionsType,
  CreatePluginType,
  EmblaCarouselType,
} from "embla-carousel";
import { useCallback } from "react";
import { getSlideLabel } from "./getDescription";

declare module "embla-carousel" {
  interface EmblaPluginsType {
    announcement: CarouselAnnouncementType;
  }
}

type OptionsType = CreateOptionsType<{}>;
export type CarouselAnnouncementType = CreatePluginType<{}, OptionsType>;

export type CarouselAnnouncementOptionsType =
  CarouselAnnouncementType["options"];

export function CarouselAnnouncement(
  userOptions: CarouselAnnouncementOptionsType = {},
): CarouselAnnouncementType {
  let emblaApi: EmblaCarouselType;

  const { announce } = useAriaAnnouncer();

  const handleSettle = useCallback((emblaApi: EmblaCarouselType) => {
    const slideCount = emblaApi?.slideNodes().length || 0;
    const slideIndexInView = emblaApi?.slidesInView()?.[0] ?? 0;
    const slideElement = emblaApi?.slideNodes()[slideIndexInView];

    const slideLabel = getSlideLabel(
      slideElement,
      slideIndexInView,
      slideCount,
    );
    announce(slideLabel);
  }, []);

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

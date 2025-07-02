import type { EmblaCarouselType } from "embla-carousel";

const settlePixelThreshold = 10;

export type SettleCallback = (emblaApi: EmblaCarouselType) => void;
export type CreateCustomSettle = (callback: SettleCallback) => SettleCallback;

export const createCustomSettle: CreateCustomSettle = (callback) =>
  function fireCustomSettle(emblaApi: EmblaCarouselType) {
    const { dragHandler, location, target } = emblaApi.internalEngine();
    if (dragHandler.pointerDown()) return;
    const displacement = target.get() - location.get();
    if (Math.abs(displacement) < settlePixelThreshold) {
      callback(emblaApi);
    }
  };

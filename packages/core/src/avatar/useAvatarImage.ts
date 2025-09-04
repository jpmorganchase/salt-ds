import { type ImgHTMLAttributes, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../utils";
import { useIsHydrated } from "./useIsHydrated";

type ImageLoadingStatus = "pending" | "loading" | "loaded" | "error";

function resolveStatus(
  image: HTMLImageElement | null,
  src?: string,
): ImageLoadingStatus {
  if (!image) {
    return "pending";
  }
  if (!src) {
    return "error";
  }
  if (image.src !== src) {
    image.src = src;
  }
  return image.complete && image.naturalWidth > 0 ? "loaded" : "loading";
}

export function useAvatarImage({
  src,
  referrerPolicy,
  crossOrigin,
}: ImgHTMLAttributes<HTMLImageElement>) {
  const isHydrated = useIsHydrated();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const image = (() => {
    if (!isHydrated) return null;
    if (!imageRef.current) {
      imageRef.current = new Image();
    }
    return imageRef.current;
  })();

  const [status, setStatus] = useState<ImageLoadingStatus>(() =>
    resolveStatus(image, src),
  );

  useIsomorphicLayoutEffect(() => {
    setStatus(resolveStatus(image, src));
  }, [image, src]);

  useIsomorphicLayoutEffect(() => {
    const updateStatus = (status: ImageLoadingStatus) => () => {
      setStatus(status);
    };

    if (!image) return;

    const handleLoad = updateStatus("loaded");
    const handleError = updateStatus("error");
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    if (typeof crossOrigin === "string") {
      image.crossOrigin = crossOrigin;
    }

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [image, crossOrigin, referrerPolicy]);

  return status;
}

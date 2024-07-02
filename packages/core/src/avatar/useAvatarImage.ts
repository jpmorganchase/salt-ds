import { type ImgHTMLAttributes, useEffect, useState } from "react";
import { useIsomorphicLayoutEffect } from "../utils";

export function useAvatarImage({ src }: ImgHTMLAttributes<HTMLImageElement>) {
  const [status, setStatus] = useState<
    "pending" | "loading" | "loaded" | "error"
  >("loading");

  useEffect(() => {
    setStatus(src ? "loading" : "pending");
  }, [src]);

  useIsomorphicLayoutEffect(() => {
    if (!src) {
      return;
    }

    let active = true;
    const image = new Image();
    image.src = src;
    const onLoad = () => active && setStatus("loaded");
    const onError = () => active && setStatus("error");

    image.addEventListener("load", onLoad, { once: true });
    image.addEventListener("error", onError, { once: true });

    return () => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("load", onError);
      active = false;
    };
  }, [src]);

  return status;
}

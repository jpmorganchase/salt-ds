import { ImgHTMLAttributes, useEffect, useState } from "react";

export function useLoaded({ src }: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState<false | "loaded" | "error">(false);

  useEffect(() => {
    if (!src) {
      return undefined;
    }

    setLoaded(false);

    let active = true;
    const image = new Image();
    const onLoad = () => active && setLoaded("loaded");
    const onError = () => active && setLoaded("error");

    image.addEventListener("load", onLoad, { once: true });
    image.addEventListener("error", onError, { once: true });

    return () => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("load", onError);
      active = false;
    };
  }, [src]);

  return loaded;
}

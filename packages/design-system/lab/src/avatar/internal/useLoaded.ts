import { ImgHTMLAttributes, useEffect, useState } from "react";

export function useLoaded({
  crossOrigin,
  referrerPolicy,
  src,
  srcSet,
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState<false | "loaded" | "error">(false);

  useEffect(() => {
    if (!src && !srcSet) {
      return undefined;
    }

    setLoaded(false);

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) {
        return;
      }
      setLoaded("loaded");
    };
    image.onerror = () => {
      if (!active) {
        return;
      }
      setLoaded("error");
    };
    image.crossOrigin = crossOrigin as HTMLImageElement["crossOrigin"];
    image.referrerPolicy = referrerPolicy as HTMLImageElement["referrerPolicy"];
    image.src = src as HTMLImageElement["src"];
    if (srcSet) {
      image.srcset = srcSet;
    }

    return () => {
      active = false;
    };
  }, [crossOrigin, referrerPolicy, src, srcSet]);

  return loaded;
}

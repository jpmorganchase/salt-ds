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
      image.style.display = "none";
      setLoaded("error");
    };
    return () => {
      active = false;
    };
  }, [src]);

  return loaded;
}

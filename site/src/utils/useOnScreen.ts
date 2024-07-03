import { type MutableRefObject, useEffect, useState } from "react";

const useOnScreen = <T extends Element>(
  ref: MutableRefObject<T | null>,
  rootMargin = "0px",
): boolean => {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        entry.isIntersecting === true && setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      },
    );

    ref.current && observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, ref]);
  return isIntersecting;
};

export default useOnScreen;

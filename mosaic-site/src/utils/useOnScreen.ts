import { useEffect, useState, MutableRefObject } from "react";

const useOnScreen = <T extends Element>(
  ref: MutableRefObject<T | null>,
  rootMargin: string = "0px"
): boolean => {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        entry.isIntersecting === true && setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );

    ref.current && observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);
  return isIntersecting;
};

export default useOnScreen;

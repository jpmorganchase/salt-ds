import { useEffect, useState, MutableRefObject } from "react";

const useOnScreen = <T extends Element>(
  ref: MutableRefObject<T>,
  rootMargin: string = "0px"
): boolean => {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);

  const observer = new IntersectionObserver(
    ([entry]) => {
      setIntersecting(entry.isIntersecting);
    },
    {
      rootMargin,
    }
  );

  useEffect(() => {
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);
  return isIntersecting;
};

export default useOnScreen;

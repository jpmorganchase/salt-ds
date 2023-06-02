import { PropsWithChildren, useEffect, useRef, useState } from "react";

export const LazyStoryCanvas = ({ children }: PropsWithChildren) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(typeof window === "undefined");
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        console.log(entry.isIntersecting);
        setVisible(true);
      }
    });
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{ minHeight: 300 }} ref={ref}>
      {visible ? children : null}
    </div>
  );
};

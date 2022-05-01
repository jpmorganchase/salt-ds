import { useEffect } from "react";

/** Load a piece of CSS to HTML <head> */
export const useHeadStyle = (css: string): void => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [css]);
};

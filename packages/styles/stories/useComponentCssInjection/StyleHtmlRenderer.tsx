import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { useWindow } from "@salt-ds/window";

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

const getStyleHtml = (window: Window) => {
  const styleElements = Array.from(
    window.document.querySelectorAll("style[data-salt-style]")
  );
  const text = styleElements
    .map((style) => {
      return style.outerHTML.replace(style.innerHTML, "");
    })
    .join("\n");

  return text;
};

const StyleHtmlRender = () => {
  const { window: targetWindow } = useWindow();

  const [styleHtml, setStyleHtml] = useState<string>(
    getStyleHtml(targetWindow)
  );
  useInterval(() => {
    setStyleHtml(getStyleHtml(targetWindow));
  }, 300);

  return (
    <div>
      <pre>{styleHtml}</pre>
    </div>
  );
};

export default StyleHtmlRender;

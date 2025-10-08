import { clsx } from "clsx";

import { useCallback, useState } from "react";
import styles from "./ColorBlock.module.css";

export const ColorBlock = ({
  colorVar,
  className,
  hideToken,
}: {
  colorVar: string;
  className?: string;
  hideToken?: boolean;
  replacementToken?: string;
}) => {
  const [transparent, setTransparent] = useState(false);

  const handleStyling = useCallback((node: HTMLDivElement) => {
    if (node) {
      setTransparent(
        window
          .getComputedStyle(node)
          .backgroundColor.replaceAll(" ", "")
          .includes("0,0,0,0"),
      );
    }
  }, []);

  return (
    <>
      <div
        ref={handleStyling}
        style={!transparent ? { background: `var(${colorVar})` } : undefined}
        className={clsx(
          styles.root,
          {
            [styles.transparent]: transparent,
          },
          className,
        )}
      />
      {!hideToken && <code className="DocGrid-code">{colorVar}</code>}
    </>
  );
};

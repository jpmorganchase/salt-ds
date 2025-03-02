import type { PreProps } from "@jpmorganchase/mosaic-components";
import { Pre as MosaicPre } from "@jpmorganchase/mosaic-components";
import { forwardRef } from "react";
import styles from "./Pre.module.css";
import "prismjs/themes/prism.css";

export const Pre = forwardRef<HTMLDivElement, PreProps>(
  function Pre(props, ref) {
    return (
      <div className={styles.pre} ref={ref}>
        <MosaicPre {...props} />
      </div>
    );
  },
);

import { BorderItem, BorderLayout } from "@salt-ds/core";
import clsx from "clsx";
import type { ReactElement } from "react";
import stickyPositioningStyles from "./StickyPositioning.module.css";
import styles from "./index.module.css";

export const StickyPositioning = (): ReactElement => (
  <BorderLayout className={stickyPositioningStyles.borderLayout}>
    <BorderItem position="north" sticky className={styles.borderItem}>
      North
    </BorderItem>
    <BorderItem position="west" className={styles.borderItem}>
      West
    </BorderItem>
    <BorderItem
      position="center"
      className={clsx(styles.borderItem, stickyPositioningStyles.center)}
    >
      <p>Center</p>
      <p>
        Center Dolor ea veniam velit esse ex nulla non anim officia commodo.
        Exercitation elit exercitation reprehenderit exercitation quis cillum
        fugiat id ad eu laboris. Amet sint sit elit elit id in do. Do nostrud
        non excepteur esse. Dolor velit sunt mollit tempor ex Lorem quis amet
        sit reprehenderit. Ut tempor cupidatat est velit excepteur. Officia
        voluptate ipsum eiusmod elit. Velit do ipsum officia pariatur cupidatat
        sint laborum nostrud sit officia tempor nostrud. Aliquip incididunt id
        ex pariatur. Culpa nisi proident et est tempor incididunt ipsum.
        Reprehenderit do dolore enim non fugiat culpa quis nisi tempor in.
        Exercitation adipisicing cupidatat qui officia pariatur magna. Duis et
        ut ut magna magna sit aute cupidatat. Irure sint excepteur elit eu
        pariatur ut aliqua sint sunt.
      </p>
    </BorderItem>
  </BorderLayout>
);

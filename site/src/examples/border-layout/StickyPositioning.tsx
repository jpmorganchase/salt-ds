import { BorderItem, BorderLayout } from "@salt-ds/core";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import styles from "./index.module.css";
import stickyPositioningStyles from "./StickyPositioning.module.css";

export const StickyPositioning = (): ReactElement => (
  <BorderLayout
    className={stickyPositioningStyles.borderLayout}
    style={{ height: "200px" }}
  >
    <BorderItem position="north" sticky className={styles.borderItem}>
      North
    </BorderItem>
    <BorderItem
      position="center"
      className={clsx(styles.borderItem, stickyPositioningStyles.center)}
      style={{ overflow: "auto" }}
    >
      <p>Center</p>
      <p>
        Sample text is provided here to illustrate how a paragraph will appear
        in this component. Placeholder sentences are used to help visualize
        layout, spacing, and formatting within the design. This generic content
        does not convey specific information or advice, but serves as a useful
        example for reviewing presentation. Adjustments can be made to fit
        particular needs or preferences. Using example text like this allows for
        easy testing and refinement of user interface elements. The wording is
        intentionally broad and non-specific, supporting a wide range of
        demonstration scenarios. Feel free to modify or replace this text as
        required for your project or application.
      </p>
    </BorderItem>
  </BorderLayout>
);

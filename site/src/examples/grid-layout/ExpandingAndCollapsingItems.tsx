import { Button, GridItem, GridLayout } from "@salt-ds/core";
import { ExpandIcon, MinimizeIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { type ReactElement, useState } from "react";
import expandingAndCollapsingItemsStyles from "./ExpandingAndCollapsingItems.module.css";
import styles from "./index.module.css";

export const ExpandingAndCollapsingItems = (): ReactElement => {
  const [expanded, setExpanded] = useState(false);

  const [shouldAnimate, setShouldAnimate] = useState(false);

  const onExpand = () => {
    setExpanded((prev) => !prev);
    if (!shouldAnimate) {
      setShouldAnimate(true); // to prevent animation on initial render
    }
  };

  return (
    <GridLayout
      columns={4}
      className={expandingAndCollapsingItemsStyles.gridLayout}
    >
      <GridItem
        colSpan={expanded ? 3 : 1}
        rowSpan={expanded ? 2 : 1}
        className={clsx(styles.gridItem, styles.active, {
          [expandingAndCollapsingItemsStyles.expanded]: expanded,
          [expandingAndCollapsingItemsStyles.collapsed]:
            shouldAnimate && !expanded,
        })}
      >
        <Button sentiment="accented" onClick={onExpand}>
          {expanded ? <MinimizeIcon /> : <ExpandIcon />}
        </Button>
      </GridItem>

      {Array.from({ length: 7 }, (_, index) => (
        <GridItem key={index} className={styles.gridItem}>
          <p>{index + 2}</p>
        </GridItem>
      ))}
    </GridLayout>
  );
};

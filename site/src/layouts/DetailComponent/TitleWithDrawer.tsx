import React, { FC } from "react";
import { Button } from "@salt-ds/core";
import { OverflowMenuIcon, CloseIcon } from "@salt-ds/icons";

import layoutStyles from "../index.module.css";
import styles from "./TitleWithDrawer.module.css";

type TitleWithDrawerProps = {
  title?: string;
  openDrawer: boolean;
  showDrawer: () => void;
  hideDrawer: () => void;
};

const TitleWithDrawer: FC<TitleWithDrawerProps> = ({
  title,
  openDrawer,
  showDrawer,
  hideDrawer,
}) => {
  return (
    <div className={styles.container}>
      <h1 className={layoutStyles.title}>{title}</h1>
      {openDrawer ? (
        <Button
          aria-label="hide additional component information"
          variant="secondary"
          onClick={hideDrawer}
        >
          <CloseIcon aria-hidden />
        </Button>
      ) : (
        <Button
          aria-label="show additional component information"
          variant="secondary"
          onClick={showDrawer}
        >
          <OverflowMenuIcon aria-hidden />
        </Button>
      )}
    </div>
  );
};

export default TitleWithDrawer;

import { Button, useIcon } from "@salt-ds/core";
import type { Dispatch, FC, SetStateAction } from "react";

import layoutStyles from "../index.module.css";
import styles from "./TitleWithDrawer.module.css";

type TitleWithDrawerProps = {
  title?: string;
  openDrawer: boolean;
  setOpenDrawer: Dispatch<SetStateAction<boolean>>;
};

const TitleWithDrawer: FC<TitleWithDrawerProps> = ({
  title,
  openDrawer,
  setOpenDrawer,
}) => {
  const { OverflowIcon, CloseIcon } = useIcon();
  const showDrawer = () => {
    setOpenDrawer(true);
  };

  const hideDrawer = () => {
    setOpenDrawer(false);
  };

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
          <OverflowIcon aria-hidden />
        </Button>
      )}
    </div>
  );
};

export default TitleWithDrawer;

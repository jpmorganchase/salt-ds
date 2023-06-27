import { FC, ReactElement } from "react";
import clsx from "clsx";
import { SaltProvider } from "@salt-ds/core";

import styles from "./MobileDrawer.module.css";

type MobileDrawerProps = { drawerContent: ReactElement; open: boolean };

const MobileDrawer: FC<MobileDrawerProps> = ({ drawerContent, open }) => (
  <div
    className={clsx(styles.container, {
      [styles.open]: open,
    })}
  >
    <SaltProvider mode="light" density="medium">
      {drawerContent}
    </SaltProvider>
  </div>
);

export default MobileDrawer;

import { Drawer as SaltDrawer } from "@salt-ds/core";
import type { ComponentPropsWithoutRef } from "react";
import { LinkBase } from "../../components/link/Link";
import { Logo } from "../../components/logo/Logo";
import styles from "./Drawer.module.css";

export function Drawer({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof SaltDrawer>) {
  return (
    <SaltDrawer className={styles.root} {...props}>
      <LinkBase className={styles.logoLink} href="/salt/index">
        <Logo className={styles.logo} />
      </LinkBase>
      {children}
    </SaltDrawer>
  );
}

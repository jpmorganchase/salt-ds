import { Button, Drawer as SaltDrawer, useIcon } from "@salt-ds/core";
import type { ComponentPropsWithoutRef } from "react";
import { LinkBase } from "../../components/link/Link";
import { Logo } from "../../components/logo/Logo";
import styles from "./Drawer.module.css";

export function Drawer({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof SaltDrawer>) {
  const { CloseIcon } = useIcon();

  return (
    <SaltDrawer className={styles.root} {...props}>
      <div className={styles.header}>
        <LinkBase className={styles.logoLink} href="/salt/index">
          <Logo className={styles.logo} />
        </LinkBase>
        <Button
          appearance="transparent"
          sentiment="neutral"
          aria-label="Close drawer"
          onClick={() => props.onOpenChange?.(false)}
        >
          <CloseIcon aria-hidden />
        </Button>
      </div>
      {children}
    </SaltDrawer>
  );
}

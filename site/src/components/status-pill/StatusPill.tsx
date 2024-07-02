import clsx from "clsx";
import { ReactNode } from "react";
import styles from "./StatusPill.module.css";

interface StatusPillProps {
  label: string;
  className?: string;
}

export const StatusPill = ({ label, className }: StatusPillProps) => {
  return <span className={clsx(styles.root, className)}>{label}</span>;
};

import { type characteristic, getCharacteristicValue } from "@salt-ds/core";
import { clsx } from "clsx";

import styles from "./ColorBlock.module.css";

export const ColorBlock = ({
  colorVar,
  className,
  hideToken,
}: {
  colorVar: string;
  className?: string;
  hideToken?: boolean;
  replacementToken?: string;
}) => {
  const characteristicName = colorVar
    .split("--salt-")[1]
    .split("-")[0] as characteristic;
  const color = getCharacteristicValue(
    "salt-theme",
    characteristicName,
    colorVar.split(`${characteristicName}-`)[1],
  );
  const withBorder = color?.replaceAll(" ", "").includes("255,255,255");
  const transparent = color?.includes("transparent");

  return (
    <>
      <div
        style={!transparent ? { background: `var(${colorVar})` } : undefined}
        className={clsx(
          styles.root,
          {
            [styles.withBorder]: withBorder,
            [styles.transparent]: transparent,
          },
          className,
        )}
      />
      {!hideToken && <code className="DocGrid-code">{colorVar}</code>}
    </>
  );
};

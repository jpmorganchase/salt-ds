import { clsx } from "clsx";
import { useEffect, useState } from "react";
import {
  characteristic,
  getCharacteristicValue,
  makePrefixer,
} from "@salt-ds/core";

import "./ColorBlock.css";

const withBaseName = makePrefixer("ColorBlock");

export const ColorBlock = ({
  colorVar,
  className,
  hideToken,
}: {
  colorVar: string;
  className?: string;
  hideToken?: boolean;
}) => {
  const characteristicName = colorVar
    .split("--salt-")[1]
    .split("-")[0] as characteristic;
  const color = getCharacteristicValue(
    "salt-theme",
    characteristicName,
    colorVar.split(`${characteristicName}-`)[1]
  );
  const withBorder = color?.replaceAll(" ", "").includes("255,255,255");
  const transparent = color?.includes("transparent");

  return (
    <>
      <div
        style={!transparent ? { background: `var(${colorVar})` } : undefined}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("withBorder")]: withBorder,
            [withBaseName("transparent")]: transparent,
          },
          className
        )}
      />
      {!hideToken && <code className="DocGrid-code">{colorVar}</code>}
    </>
  );
};

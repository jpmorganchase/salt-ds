import type { TooltipLinkListLink } from "@storybook/components";
import {
  IconButton,
  Separator,
  TooltipLinkList,
  WithTooltip,
} from "@storybook/components";
import { BeakerIcon, CheckIcon } from "@storybook/icons";
import { useGlobals } from "@storybook/manager-api";
import type { GlobalTypes } from "@storybook/types";
import { clsx } from "clsx";
// biome-ignore lint/correctness/noUnusedImports: SB addons only support the classic runtime
import React, { type AnchorHTMLAttributes } from "react";

import "./ThemeNextToolbar.css";

const description = "Theme next controls";

const camelCaseToWords = (s: string) => {
  const result = s.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const defaultValues = {
  themeNext: "disable",
  corner: "sharp",
  accent: "blue",
  headingFont: "Open Sans",
  actionFont: "Open Sans",
};

export const globalOptions: GlobalTypes = {
  themeNext: {
    name: "Experimental theme next",
    description: "Turn on/off theme next",
    items: ["enable", "disable"],
  },
  corner: {
    name: "Experimental corner",
    description: "Switch corner to sharp / rounded",
    items: ["sharp", "rounded"],
  },
  headingFont: {
    name: "Experimental heading font",
    description: "Switch heading font to open sans / amplitude",
    items: ["Open Sans", "Amplitude"],
  },
  accent: {
    name: "Experimental accent",
    description: "Switch accent to blue / teal",
    items: ["blue", "teal"],
  },
  actionFont: {
    name: "Experimental action font",
    description: "Switch action font to open sans / amplitude",
    items: ["Open Sans", "Amplitude"],
  },
};

const GroupWrapper = ({
  className,
  children,
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <div className={clsx(className, "theme-next-toolbar-group-wrapper")}>
      {children}
    </div>
  );
};

export const ThemeNextToolbar = ({ active }: { active?: boolean }) => {
  const [globals, updateGlobals] = useGlobals();

  const items: TooltipLinkListLink[] = Object.keys(globalOptions).flatMap(
    (globalKey) => {
      return [
        {
          id: `theme-next-${globalKey}-header`,
          title: camelCaseToWords(globalKey),
          LinkWrapper: GroupWrapper, // Custom wrapper to render group
          href: "#", // Without href, `LinkWrapper` will not work
        },
        ...globalOptions[globalKey].items.map((value: string) => {
          const disabled =
            globalKey === "themeNext" ? false : globals.themeNext !== "enable";
          const active = globals[globalKey] === value;

          return {
            id: `theme-next-${globalKey}-${value}`,
            right: active ? (
              <CheckIcon style={{ fill: "inherit" }} />
            ) : undefined,
            active,
            title: camelCaseToWords(value),
            onClick: () => {
              !disabled && updateGlobals({ [globalKey]: value });
            },
            disabled,
          };
        }),
      ];
    },
  );

  const isThemeNext = globals.themeNext === "enable";

  return (
    <>
      <Separator />
      <WithTooltip
        tooltip={() => <TooltipLinkList links={items} />}
        trigger="click"
        closeOnOutsideClick
      >
        <IconButton title={description} active={active || isThemeNext}>
          {isThemeNext ? <CheckIcon /> : <BeakerIcon />} Theme Next
        </IconButton>
      </WithTooltip>
    </>
  );
};

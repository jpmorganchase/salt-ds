import type { TooltipLinkListLink } from "@storybook/components";
import {
  IconButton,
  TooltipLinkList,
  WithTooltip,
} from "@storybook/components";
import { BeakerIcon, CheckIcon } from "@storybook/icons";
import { GLOBALS_UPDATED } from "@storybook/core-events";
import { useGlobals, useStorybookApi } from "@storybook/manager-api";
import React, { useState } from "react";

const description = "Theme next controls";

const camelCaseToWords = (s: string) => {
  const result = s.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const globalOptions: Record<
  string,
  { name: string; description: string; defaultValue: string; items: string[] }
> = {
  themeNext: {
    name: "Experimental theme next",
    description: "Turn on/off theme next",
    defaultValue: "disable",
    items: ["enable", "disable"],
  },
  corner: {
    name: "Experimental corner",
    description: "Switch corner to sharp / rounded",
    defaultValue: "sharp",
    items: ["sharp", "rounded"],
  },
  headingFont: {
    name: "Experimental heading font",
    description: "Switch heading font to open sans / amplitude",
    defaultValue: "Open Sans",
    items: ["Open Sans", "Amplitude"],
  },
  accent: {
    name: "Experimental accent",
    description: "Switch accent to blue / teal",
    defaultValue: "blue",
    items: ["blue", "teal"],
  },
  actionFont: {
    name: "Experimental action font",
    description: "Switch action font to open sans / amplitude",
    defaultValue: "Open Sans",
    items: ["Open Sans", "Amplitude"],
  },
};

export const ThemeNextToolbar = ({ active }: { active?: boolean }) => {
  // `initialized` is for avoiding incorrect `isActive` when component initializes
  // what leads to blinking effect (inactive -> active -> inactive)
  const [initialized, setInitialized] = useState(true);

  useStorybookApi()
    .getChannel()
    ?.on(GLOBALS_UPDATED, () => setInitialized(true));

  const [globals, updateGlobals] = useGlobals();

  const isActive = initialized;

  if (!isActive) return null;

  const items: TooltipLinkListLink[] = Object.keys(globalOptions).flatMap(
    (globalKey) => {
      return [
        {
          id: `theme-next-${globalKey}-header`,
          disabled: true, // Fake a group header
          title: camelCaseToWords(globalKey),
        },
        ...globalOptions[globalKey].items.map((value) => ({
          id: `theme-next-${globalKey}-${value}`,
          right:
            globals[globalKey] === value ? (
              <CheckIcon style={{ fill: "inherit" }} />
            ) : undefined,
          title: camelCaseToWords(value),
          onClick: () => {
            updateGlobals({ [globalKey]: value });
          },
        })),
      ];
    }
  );

  //   console.log({ globals, isActive, active });

  return (
    <WithTooltip
      tooltip={() => <TooltipLinkList links={items} />}
      trigger="click"
      closeOnOutsideClick
    >
      <IconButton title={description} active={isActive}>
        <BeakerIcon /> Theme Next
      </IconButton>
    </WithTooltip>
  );
};

import type { TooltipLinkListLink } from "@storybook/components";
import {
  IconButton,
  Separator,
  TooltipLinkList,
  WithTooltip,
} from "@storybook/components";
import { BeakerIcon, CheckIcon } from "@storybook/icons";
import { useGlobals } from "@storybook/manager-api";
import { clsx } from "clsx";
import type { AnchorHTMLAttributes } from "react";

import "./ComponentBaseToolbar.css";

const description = "Component Base controls";

const camelCaseToWords = (s: string) => {
  const result = s.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const globalOptions: Record<
  string,
  { name: string; description: string; defaultValue: string; items: string[] }
> = {
  spacing: {
    name: "componentBaseSpacing",
    description: "Switch spacing",
    defaultValue: '',
    items: ["small", "medium", "large"],
  },
  size: {
    name: "componentBaseSize",
    description: "Switch size",
    defaultValue: "",
    items: ["small", "medium", "large"],
  }
};

const GroupWrapper = ({
  className,
  children,
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <div className={clsx(className, "component-base-toolbar-group-wrapper")}>
      {children}
    </div>
  );
};

export const ComponentBaseToolbar = ({ active }: { active?: boolean }) => {
  const [globals, updateGlobals] = useGlobals();

  const items: TooltipLinkListLink[] = Object.keys(globalOptions).flatMap(
    (globalKey) => {
      return [
        {
          id: `component-base-${globalKey}-header`,
          title: camelCaseToWords(globalKey),
          LinkWrapper: GroupWrapper, // Custom wrapper to render group
          href: "#", // Without href, `LinkWrapper` will not work
        },
        ...globalOptions[globalKey].items.map((value) => {
          const active = globals[globalKey] === value;

          return {
            id: `component-base-${globalKey}-${value}`,
            right: active ? (
              <CheckIcon style={{ fill: "inherit" }} />
            ) : undefined,
            active,
            title: camelCaseToWords(value),
            onClick: () => {
              updateGlobals({ [globalKey]: value });
            },
          };
        }),
      ];
    },
  );

  return (
    <>
      <Separator />
      <WithTooltip
        tooltip={() => <TooltipLinkList links={items} />}
        trigger="click"
        closeOnOutsideClick
      >
        <IconButton title={description} active={active}>
          <CheckIcon /> Component Base Settings
        </IconButton>
      </WithTooltip>
    </>
  );
};

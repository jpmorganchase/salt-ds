import { FlexLayout, StackLayout } from "@salt-ds/core";
import {
  AddDocumentIcon,
  AddDocumentSolidIcon,
  Icon,
  type IconProps,
} from "@salt-ds/icons";
import { FormField, Input } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { createElement, type ElementType, useMemo, useState } from "react";
import { allIcons } from "./icon.all";

const formatIconName = (icon: string) => {
  const fullName = icon.replace(/([A-Z])/g, " $1");
  return fullName.substring(0, fullName.lastIndexOf(" "));
};

const allIconNames = allIcons.map((iconComponent) => ({
  name: formatIconName(iconComponent.displayName || " "),
  icon: iconComponent,
}));

export default {
  title: "Icons/Icon",
  component: Icon,
} as Meta<typeof Icon>;

const sizes = [1, 2, 3, 4, 5] as const;

const IconGrid = ({
  Icon: IconComponent,
}: {
  Icon: ElementType<IconProps>;
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${sizes.length}, 100px)`,

        gridGap: 10,
      }}
    >
      {sizes.map((size) => (
        <IconComponent size={size} key={size} />
      ))}
    </div>
  );
};

export const SaltIcon: StoryFn<typeof Icon> = (props) => (
  <AddDocumentIcon {...props} />
);
export const SaltIconMultipleSizes: StoryFn<typeof Icon> = () => (
  <IconGrid Icon={AddDocumentIcon} />
);

export const SaltTypes: StoryFn<typeof Icon> = () => (
  <FlexLayout wrap gap={2}>
    <AddDocumentIcon size={4} />
    <AddDocumentSolidIcon size={4} />
  </FlexLayout>
);

export const CustomSVGIcon: StoryFn<typeof Icon> = () => {
  const CustomIcon = useMemo(
    () => (props: IconProps) => {
      return (
        <Icon aria-label="custom icon" viewBox="0 0 18 18" {...props}>
          <path d="M16,2V16H2V2Zm.5-1H1.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,.5-.5V1.5A.5.5,0,0,0,16.5,1Z" />
          <rect height="4" rx="0.25" width="12" x="3" y="11" />
        </Icon>
      );
    },
    [],
  );

  return <IconGrid Icon={CustomIcon} />;
};

export const CustomIconFullSVG: StoryFn<typeof Icon> = () => {
  const CustomIcon = useMemo(
    () => (props: IconProps) => {
      return (
        <Icon aria-label="custom icon" {...props}>
          <svg viewBox="0 0 18 18">
            <path d="M16,2V16H2V2Zm.5-1H1.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,.5-.5V1.5A.5.5,0,0,0,16.5,1Z" />
            <rect height="4" rx="0.25" width="12" x="3" y="11" />
          </svg>
        </Icon>
      );
    },
    [],
  );

  return <IconGrid Icon={CustomIcon} />;
};

export const AllIcons: StoryFn<typeof Icon> = () => {
  return (
    <FlexLayout wrap gap={1} style={{ paddingBlock: "1rem" }}>
      {allIcons.map((iconComponent, i) => {
        return createElement(iconComponent, { key: i, size: 1 });
      })}
    </FlexLayout>
  );
};

export const AllIconsWithSearch: StoryFn<typeof Icon> = () => {
  const [inputText, setInputText] = useState("");

  return (
    <StackLayout separators>
      <FormField
        label={"search icon"}
        style={{ marginBlock: "1rem", maxWidth: "300px" }}
      >
        <Input value={inputText} onChange={(_, value) => setInputText(value)} />
      </FormField>
      <FlexLayout wrap gap={3} style={{ paddingBlock: "1rem" }}>
        {allIconNames
          .filter(({ name, icon }) => new RegExp(inputText, "i").test(name))
          .map(({ name, icon }, i) => {
            return (
              <StackLayout
                style={{ width: "150px" }}
                gap={1}
                align="center"
                key={name}
              >
                {createElement(icon, {
                  key: i,
                  size: 2,
                })}
                <p style={{ margin: 0 }}>{name}</p>
              </StackLayout>
            );
          })}
      </FlexLayout>
    </StackLayout>
  );
};

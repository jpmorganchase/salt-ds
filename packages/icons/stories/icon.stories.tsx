import { createElement, ElementType, useMemo, useState } from "react";
import {
  AddDocumentIcon,
  AddDocumentSolidIcon,
  Icon,
  IconProps,
} from "@jpmorganchase/uitk-icons";
import { allIcons, allIconsNames } from "./icon.all";
import CodeBrackets from "docs/assets/code-brackets.svg";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexLayout, FormField, Input, StackLayout } from "../../core";

export default {
  title: "Icons/Icon",
  component: Icon,
} as ComponentMeta<typeof Icon>;

const IconGrid = ({
  Icon: IconComponent,
}: {
  Icon: ElementType<IconProps>;
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 100px 100px",
        gridTemplateRows: "100px auto",
        gridGap: 10,
      }}
    >
      <IconComponent size="small" />
      <IconComponent size="medium" />
      <IconComponent size="large" />

      <span>Small</span>
      <span>Medium</span>
      <span>Large</span>
    </div>
  );
};

export const ToolkitIcon: ComponentStory<typeof Icon> = () => (
  <IconGrid Icon={AddDocumentIcon} />
);

export const ToolkitTypes: ComponentStory<typeof Icon> = () => (
  <FlexLayout wrap gap={2}>
    <AddDocumentIcon size="medium" />
    <AddDocumentSolidIcon size="medium" />
  </FlexLayout>
);

export const CustomSVGIcon: ComponentStory<typeof Icon> = () => {
  const CustomIcon = useMemo(
    () => (props: IconProps) => {
      const svg = (
        <svg viewBox="0 0 18 18">
          <path d="M16,2V16H2V2Zm.5-1H1.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,.5-.5V1.5A.5.5,0,0,0,16.5,1Z" />
          <rect height="4" rx="0.25" width="12" x="3" y="11" />
        </svg>
      );
      return <Icon {...props}>{svg}</Icon>;
    },
    []
  );

  return <IconGrid Icon={CustomIcon} />;
};

export const SVGImportAsFile: ComponentStory<typeof Icon> = () => {
  const FileIcon = useMemo(
    () => (props: IconProps) =>
      (
        <Icon {...props}>
          <img src={CodeBrackets as string} alt="Code Brackets" />
        </Icon>
      ),
    []
  );
  return <IconGrid Icon={FileIcon} />;
};

export const AllIcons: ComponentStory<typeof Icon> = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(15, auto)",
        gap: 8,
      }}
    >
      {allIcons.map((iconComponent, i) =>
        createElement(iconComponent, { key: i, size: 24 })
      )}
    </div>
  );
};

export const AllIconsWithSearch: ComponentStory<typeof Icon> = () => {
  const [inputText, setInputText] = useState("");
  return (
    <StackLayout separators>
      <FormField
        label={"search icon"}
        style={{ marginBlock: "1rem", maxWidth: "300px" }}
      >
        <Input value={inputText} onChange={(_, value) => setInputText(value)} />
      </FormField>
      <FlexLayout wrap gap={1}>
        {allIconsNames
          .filter(({ name, icon }) => new RegExp(inputText, "i").test(name))
          .map(({ name, icon }, i) => {
            return (
              <StackLayout style={{ width: "150px" }} align="center">
                {createElement(icon, {
                  key: i,
                  size: 24,
                })}
                <p>{name.slice(0, -1)}</p>
              </StackLayout>
            );
          })}
      </FlexLayout>
    </StackLayout>
  );
};

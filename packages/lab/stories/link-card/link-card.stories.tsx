import { ChangeEvent, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  Card,
  H3,
  Text,
  StackLayout,
  RadioButton,
  RadioButtonGroup,
  Label,
  Link,
} from "@salt-ds/core";

import { LinkCard, LinkCardProps } from "@salt-ds/lab";

import "./link-card.stories.css";

export default {
  title: "Lab/Link Card",
  component: LinkCard,
} as Meta<typeof LinkCard>;

const exampleData = {
  title: "Sustainable investing products",
  content:
    "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
};

export const Default: StoryFn<typeof Card> = () => (
  <LinkCard style={{ width: "260px" }} href="#" target="_blank">
    <StackLayout gap={1}>
      <H3>{exampleData.title}</H3>
      <Text>{exampleData.content}</Text>
    </StackLayout>
  </LinkCard>
);

export const Disabled: StoryFn<typeof Card> = () => (
  <LinkCard style={{ width: "260px" }} className="withImage" disabled>
    <StackLayout gap={1} style={{ padding: "var(--salt-spacing-300)" }}>
      <H3>{exampleData.title}</H3>
      <Text>{exampleData.content}</Text>
    </StackLayout>
  </LinkCard>
);

export const AccentPlacement: StoryFn<typeof Card> = () => {
  const [placement, setPlacement] =
    useState<LinkCardProps["accentPlacement"]>("bottom");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlacement(event.target.value as LinkCardProps["accentPlacement"]);
  };
  return (
    <StackLayout style={{ width: "266px" }}>
      <LinkCard accentPlacement={placement}>
        <StackLayout gap={1}>
          <H3>{exampleData.title}</H3>
          <Text>{exampleData.content}</Text>
        </StackLayout>
      </LinkCard>
      <RadioButtonGroup direction={"horizontal"} defaultValue="bottom">
        <RadioButton
          key="bottom"
          label="bottom"
          value="bottom"
          onChange={handleChange}
          checked
        />
        <RadioButton
          key="top"
          label="top"
          value="top"
          onChange={handleChange}
        />
        <RadioButton
          key="left"
          label="left"
          value="left"
          onChange={handleChange}
        />
        <RadioButton
          key="right"
          label="right"
          value="right"
          onChange={handleChange}
        />
      </RadioButtonGroup>
    </StackLayout>
  );
};

export const Size: StoryFn<typeof Card> = () => {
  const sizes = ["small", "medium", "large"] as const;
  return (
    <StackLayout style={{ width: "266px" }}>
      {sizes.map((size) => {
        return (
          <StackLayout key={size} align="end">
            <StackLayout direction="row">
              <LinkCard size={size}>
                <StackLayout gap={1}>
                  <H3>{exampleData.title}</H3>
                  <Text>{exampleData.content}</Text>
                </StackLayout>
              </LinkCard>
            </StackLayout>
            <Label>Size: {size}</Label>
          </StackLayout>
        );
      })}
    </StackLayout>
  );
};

export const Variant: StoryFn<typeof Card> = () => {
  const variants = ["primary", "secondary"] as const;
  return (
    <StackLayout style={{ width: "266px" }}>
      {variants.map((variant) => {
        return (
          <StackLayout align="end">
            <StackLayout direction="row" key={variant}>
              <LinkCard variant={variant}>
                <StackLayout gap={1}>
                  <H3>{exampleData.title}</H3>
                  <Text>{exampleData.content}</Text>
                </StackLayout>
              </LinkCard>
            </StackLayout>
            <Label>Variant: {variant}</Label>
          </StackLayout>
        );
      })}
    </StackLayout>
  );
};

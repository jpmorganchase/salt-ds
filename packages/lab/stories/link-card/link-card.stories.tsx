import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  H3,
  Text,
  StackLayout,
  RadioButton,
  RadioButtonGroup,
  Label,
} from "@salt-ds/core";

import { LinkCard, LinkCardProps } from "@salt-ds/lab";

export default {
  title: "Lab/Link Card",
  component: LinkCard,
} as Meta<typeof LinkCard>;

export const Default: StoryFn<typeof LinkCard> = (args) => (
  <LinkCard {...args} style={{ width: "260px" }} href="#">
    <StackLayout gap={1}>
      <H3>Sustainable investing products</H3>
      <Text>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </StackLayout>
  </LinkCard>
);

export const AccentPlacement: StoryFn<typeof LinkCard> = (args) => {
  const [placement, setPlacement] = useState<LinkCardProps["accent"]>("bottom");

  return (
    <StackLayout style={{ width: "266px" }}>
      <LinkCard {...args} accent={placement}>
        <StackLayout gap={1}>
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
        </StackLayout>
      </LinkCard>
      <RadioButtonGroup
        direction={"horizontal"}
        defaultValue="bottom"
        onChange={(event) =>
          setPlacement(event.target.value as LinkCardProps["accent"])
        }
      >
        <RadioButton label="bottom" value="bottom" checked />
        <RadioButton label="top" value="top" />
        <RadioButton label="left" value="left" />
        <RadioButton label="right" value="right" />
      </RadioButtonGroup>
    </StackLayout>
  );
};

export const Variant: StoryFn<typeof LinkCard> = (args) => {
  const variants = ["primary", "secondary"] as const;
  return (
    <StackLayout style={{ width: "266px" }}>
      {variants.map((variant) => {
        return (
          <StackLayout align="end" key={variant}>
            <StackLayout direction="row">
              <LinkCard {...args} variant={variant}>
                <StackLayout gap={1}>
                  <H3>Sustainable investing products</H3>
                  <Text>
                    We have a commitment to provide a wide range of investment
                    solutions to enable you to align your financial goals to
                    your values.
                  </Text>
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

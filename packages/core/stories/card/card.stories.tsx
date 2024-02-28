import { ChangeEvent, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  Button,
  Card,
  InteractableCard,
  InteractableCardProps,
  H3,
  Text,
  Link,
  StackLayout,
  RadioButton,
  RadioButtonGroup,
  Label,
  CardProps,
} from "@salt-ds/core";
import exampleImage from "./../assets/exampleImage1x.png";

import "./card.stories.css";

export default {
  title: "Core/Card",
  component: Card,
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof Card>;

export const Default: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "260px" }}>
    <StackLayout gap={1}>
      <H3>Sustainable investing products</H3>
      <Text>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </StackLayout>
  </Card>
);

export const DefaultWithImage: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "260px" }}>
    <StackLayout gap={3}>
      <img alt="example image" src={exampleImage} style={{ width: "100%" }} />
      <StackLayout gap={1}>
        <H3>Sustainable investing products</H3>
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
      </StackLayout>
    </StackLayout>
  </Card>
);

export const DefaultWithLink: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "260px" }}>
    <StackLayout gap={1}>
      <H3>Sustainable investing products</H3>
      <StackLayout gap={1}>
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
        <Link href="#" IconComponent={null}>
          View our range of funds
        </Link>
      </StackLayout>
    </StackLayout>
  </Card>
);

export const DefaultWithButton: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "260px" }}>
    <StackLayout gap={1}>
      <H3>Sustainable investing products</H3>
      <StackLayout gap={2} align="start">
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
        <Button>View funds</Button>
      </StackLayout>
    </StackLayout>
  </Card>
);

export const AccentVariations: StoryFn<typeof Card> = (args) => {
  const [placement, setPlacement] = useState<CardProps["accent"]>("bottom");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlacement(event.target.value as CardProps["accent"]);
  };

  return (
    <StackLayout style={{ width: "266px" }}>
      <Card {...args} accent={placement} hoverable>
        <StackLayout gap={1}>
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
        </StackLayout>
      </Card>
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

export const Variants: StoryFn<typeof Card> = (args) => {
  const variants = ["primary", "secondary"] as const;
  return (
    <StackLayout style={{ width: 600 }}>
      {variants.map((variant) => {
        return (
          <StackLayout align="end">
            <StackLayout direction="row" key={variant}>
              <Card {...args} variant={variant}>
                <StackLayout gap={1}>
                  <H3>Sustainable investing products</H3>
                  <Text>
                    We have a commitment to provide a wide range of investment
                    solutions to enable you to align your financial goals to
                    your values.
                  </Text>
                </StackLayout>
              </Card>
            </StackLayout>
            <Label>Variant: {variant}</Label>
          </StackLayout>
        );
      })}
    </StackLayout>
  );
};

export const Interactable: StoryFn<typeof Card> = (args) => (
  <InteractableCard {...args} style={{ width: "260px" }}>
    <StackLayout gap={1}>
      <H3>Sustainable investing products</H3>
      <Text>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </StackLayout>
  </InteractableCard>
);

export const InteractableDisabled: StoryFn<typeof Card> = (args) => (
  <InteractableCard
    style={{ width: "260px" }}
    onClick={() => console.log("Clicked")}
    data-testid="card-disabled-example"
    disabled
  >
    <StackLayout gap={1}>
      <H3 disabled>Sustainable investing products</H3>
      <Text disabled>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </StackLayout>
  </InteractableCard>
);

export const InteractableAccentVariations: StoryFn<typeof Card> = (args) => {
  const [placement, setPlacement] =
    useState<InteractableCardProps["accentPlacement"]>("bottom");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlacement(
      event.target.value as InteractableCardProps["accentPlacement"]
    );
  };
  return (
    <StackLayout style={{ width: "266px" }}>
      <InteractableCard {...args} accentPlacement={placement}>
        <StackLayout gap={1}>
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
        </StackLayout>
      </InteractableCard>
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

export const InteractableAsBlockLink: StoryFn<typeof Card> = (args) => {
  return (
    <Link style={{ textDecoration: "none" }} href="#" IconComponent={null}>
      <InteractableCard {...args} style={{ width: "266px" }}>
        <StackLayout gap={1}>
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
        </StackLayout>
      </InteractableCard>
    </Link>
  );
};

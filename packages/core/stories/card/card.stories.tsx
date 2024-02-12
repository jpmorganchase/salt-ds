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
  ToggleButton,
} from "@salt-ds/core";
import exampleImage from "./../assets/exampleImage1x.png";

import "./card.stories.css";

export default {
  title: "Core/Card",
  component: Card,
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof Card>;

const exampleData = {
  title: "Sustainable investing products",
  content:
    "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
};

export const Default: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <StackLayout gap={1}>
      <H3>{exampleData.title}</H3>
      <Text>{exampleData.content}</Text>
    </StackLayout>
  </Card>
);

export const DefaultWithImage: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <StackLayout gap={3}>
      <img alt="example image" src={exampleImage} style={{ width: "100%" }} />
      <StackLayout gap={1}>
        <H3>{exampleData.title}</H3>
        <Text>{exampleData.content}</Text>
      </StackLayout>
    </StackLayout>
  </Card>
);

export const DefaultWithLink: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <StackLayout gap={1}>
      <H3>{exampleData.title}</H3>
      <StackLayout gap={1}>
        <Text>{exampleData.content}</Text>
        <Link href="#" IconComponent={null}>
          View our range of funds
        </Link>
      </StackLayout>
    </StackLayout>
  </Card>
);

export const DefaultWithButton: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <StackLayout gap={1}>
      <H3>{exampleData.title}</H3>
      <StackLayout gap={2} align="start">
        <Text>{exampleData.content}</Text>
        <Button>View funds</Button>
      </StackLayout>
    </StackLayout>
  </Card>
);

export const HoverEffect: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }} hoverEffect>
    <StackLayout gap={1}>
      <H3>{exampleData.title}</H3>
      <StackLayout gap={2} align="start">
        <Text>{exampleData.content}</Text>
        <Button>View funds</Button>
      </StackLayout>
    </StackLayout>
  </Card>
);

export const AccentVariations: StoryFn<typeof Card> = () => {
  const [hoverEffect, setHoverEffect] = useState<boolean>(false);

  const [placement, setPlacement] =
    useState<CardProps["accentPlacement"]>("bottom");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlacement(event.target.value as CardProps["accentPlacement"]);
  };

  const handleToggle = () => {
    setHoverEffect((old) => !old);
  };

  return (
    <StackLayout style={{ width: "266px" }}>
      <Card accentPlacement={placement} hoverEffect={hoverEffect}>
        <StackLayout gap={1}>
          <H3>{exampleData.title}</H3>
          <Text>{exampleData.content}</Text>
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
      <ToggleButton
        value="hoverEffect"
        selected={hoverEffect}
        onChange={handleToggle}
      >
        hover effect
      </ToggleButton>
    </StackLayout>
  );
};

export const Sizes: StoryFn<typeof Card> = () => {
  const sizes = ["small", "medium", "large"] as const;
  return (
    <StackLayout style={{ width: 600 }}>
      {sizes.map((size) => {
        return (
          <StackLayout key={size} align="end">
            <StackLayout direction="row">
              <Card paddingSize={size}>
                <StackLayout gap={1}>
                  <H3>{exampleData.title}</H3>
                  <Text>{exampleData.content}</Text>
                </StackLayout>
              </Card>
            </StackLayout>
            <Label>Size: {size}</Label>
          </StackLayout>
        );
      })}
    </StackLayout>
  );
};

export const Variants: StoryFn<typeof Card> = () => {
  const variants = ["primary", "secondary"] as const;
  return (
    <StackLayout style={{ width: 600 }}>
      {variants.map((variant) => {
        return (
          <StackLayout align="end">
            <StackLayout direction="row" key={variant}>
              <Card variant={variant}>
                <StackLayout gap={1}>
                  <H3>{exampleData.title}</H3>
                  <Text>{exampleData.content}</Text>
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

export const Interactable: StoryFn<typeof Card> = () => (
  <InteractableCard style={{ width: "256px" }}>
    <StackLayout gap={1}>
      <H3>{exampleData.title}</H3>
      <Text>{exampleData.content}</Text>
    </StackLayout>
  </InteractableCard>
);

export const InteractableDisabled: StoryFn<typeof Card> = () => (
  <InteractableCard
    style={{ width: "256px" }}
    onClick={() => console.log("Clicked")}
    data-testid="card-disabled-example"
    disabled
  >
    <StackLayout gap={1}>
      <H3 disabled>{exampleData.title}</H3>
      <Text disabled>{exampleData.content}</Text>
    </StackLayout>
  </InteractableCard>
);

export const InteractableAccentVariations: StoryFn<typeof Card> = () => {
  const [placement, setPlacement] =
    useState<InteractableCardProps["accentPlacement"]>("bottom");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlacement(
      event.target.value as InteractableCardProps["accentPlacement"]
    );
  };
  return (
    <StackLayout style={{ width: "266px" }}>
      <InteractableCard accentPlacement={placement}>
        <StackLayout gap={1}>
          <H3>{exampleData.title}</H3>
          <Text>{exampleData.content}</Text>
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

export const InteractableAsBlockLink: StoryFn<typeof Card> = () => {
  return (
    <Link style={{ textDecoration: "none" }} href="#" IconComponent={null}>
      <InteractableCard style={{ width: "266px" }}>
        <StackLayout gap={1}>
          <H3>{exampleData.title}</H3>
          <Text>{exampleData.content}</Text>
        </StackLayout>
      </InteractableCard>
    </Link>
  );
};

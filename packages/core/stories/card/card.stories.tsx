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
  InteractableCardGroup,
  Avatar,
  CheckboxIcon,
  InteractableCardValue,
  RadioButtonIcon,
} from "@salt-ds/core";
import exampleImage from "./../assets/exampleImage1x.png";

import "./card.stories.css";
import { CreditCardIcon, BankIcon, DiamondIcon } from "@salt-ds/icons";

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

export const DefaultInteractableCard: StoryFn<typeof InteractableCard> = (
  args
) => (
  <InteractableCard {...args} style={{ width: "256px" }}>
    <StackLayout gap={1}>
      <H3>Sustainable investing products</H3>
      <Text>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </StackLayout>
  </InteractableCard>
);

export const DisabledInteractableCard: StoryFn<typeof InteractableCard> = (
  args
) => (
  <InteractableCard {...args} style={{ width: "256px" }} disabled accent="top">
    <StackLayout gap={1}>
      <H3 disabled>Sustainable investing products</H3>
      <Text disabled>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </StackLayout>
  </InteractableCard>
);

export const SelectedInteractableCard: StoryFn<typeof InteractableCard> = (
  args
) => (
  <InteractableCard {...args} style={{ width: "256px" }} selected accent="top">
    <StackLayout gap={1}>
      <H3>Sustainable investing products</H3>
      <Text>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </StackLayout>
  </InteractableCard>
);

export const SelectedDisabledInteractableCard: StoryFn<
  typeof InteractableCard
> = (args) => (
  <InteractableCard
    {...args}
    style={{ width: "256px" }}
    selected
    disabled
    accent="top"
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

export const InteractableCardGroupSingleSelect: StoryFn<
  typeof InteractableCard
> = (args) => (
  <InteractableCardGroup>
    <InteractableCard {...args} value="card" style={{ width: "180px" }}>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <CreditCardIcon size={2} />
          <H3>Credit Card</H3>
        </StackLayout>
        <Text>Link credit card to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard {...args} style={{ width: "180px" }} disabled>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <BankIcon size={2} />
          <H3 disabled>Bank wire</H3>
        </StackLayout>
        <Text disabled>Link your bank to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard {...args} value="crypto" style={{ width: "180px" }}>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <DiamondIcon size={2} />
          <H3>Cryptocurrency</H3>
        </StackLayout>
        <Text>Link your crypto to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
  </InteractableCardGroup>
);

export const InteractableCardGroupMultiSelect: StoryFn<
  typeof InteractableCard
> = (args) => (
  <InteractableCardGroup selectionVariant="multiselect">
    <InteractableCard {...args} value="card" style={{ width: "180px" }}>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <CreditCardIcon size={2} />
          <H3>Credit Card</H3>
        </StackLayout>
        <Text>Link credit card to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard {...args} style={{ width: "180px" }} disabled>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <BankIcon size={2} />
          <H3 disabled>Bank wire</H3>
        </StackLayout>
        <Text disabled>Link your bank to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard {...args} value="crypto" style={{ width: "180px" }}>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <DiamondIcon size={2} />
          <H3>Cryptocurrency</H3>
        </StackLayout>
        <Text>Link your crypto to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
  </InteractableCardGroup>
);

export const InteractableCardGroupRadio: StoryFn<typeof InteractableCard> = (
  args
) => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <StackLayout>
      <StackLayout gap={1}>
        <H3>Payment method</H3>
        <Text>Choose your payment method from the options below.</Text>
      </StackLayout>
      <InteractableCardGroup
        onChange={(_event, value) => {
          setSelected(value);
        }}
      >
        <InteractableCard {...args} value="card" style={{ width: "180px" }}>
          <StackLayout gap={1}>
            <StackLayout gap={1} direction="row" align="center">
              <CreditCardIcon size={2} />
              <H3>Credit Card</H3>
            </StackLayout>
            <StackLayout direction="row" gap={1}>
              <RadioButtonIcon checked={selected === "card"} />
              <Text>Link credit card to your payments account.</Text>
            </StackLayout>
          </StackLayout>
        </InteractableCard>
        <InteractableCard value="wire" style={{ width: "180px" }}>
          <StackLayout gap={1}>
            <StackLayout gap={1} direction="row" align="center">
              <BankIcon size={2} />
              <H3>Bank wire</H3>
            </StackLayout>
            <StackLayout direction="row" gap={1}>
              <RadioButtonIcon checked={selected === "wire"} />
              <Text>Link your bank to your payments account.</Text>
            </StackLayout>
          </StackLayout>
        </InteractableCard>
        <InteractableCard value="crypto" style={{ width: "180px" }}>
          <StackLayout gap={1}>
            <StackLayout gap={1} direction="row" align="center">
              <DiamondIcon size={2} />
              <H3>Cryptocurrency</H3>
            </StackLayout>
            <StackLayout direction="row" gap={1}>
              <RadioButtonIcon checked={selected === "crypto"} />
              <Text>Link your crypto to your payments account.</Text>
            </StackLayout>
          </StackLayout>
        </InteractableCard>
      </InteractableCardGroup>
    </StackLayout>
  );
};

export const InteractableCardGroupCheckbox: StoryFn<typeof InteractableCard> = (
  args
) => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <InteractableCardGroup
      onChange={(_event, value) => {
        setSelected(value);
      }}
      selectionVariant="multiselect"
    >
      <InteractableCard {...args} value="jane-doe" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar size={1} />
            <H3>Jane Doe</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon checked={selected?.includes("jane-doe")} />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="tom-roberts" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar size={1} />
            <H3>Tom Roberts</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon checked={selected?.includes("tom-roberts")} />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="ray-smith" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar size={1} />
            <H3>Ray Smith</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon checked={selected?.includes("ray-smith")} />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
    </InteractableCardGroup>
  );
};

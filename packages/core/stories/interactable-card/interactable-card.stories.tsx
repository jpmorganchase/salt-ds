import {
  Avatar,
  CheckboxIcon,
  H3,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardProps,
  type InteractableCardValue,
  Label,
  RadioButton,
  RadioButtonGroup,
  RadioButtonIcon,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { BankIcon, CreditCardIcon, DiamondIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";

import "./interactable-card.stories.css";

export default {
  title: "Core/Interactable Card",
  component: InteractableCard,
} as Meta<typeof InteractableCard>;

export const Default: StoryFn<typeof InteractableCard> = (args) => (
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

export const Disabled: StoryFn<typeof InteractableCard> = (args) => (
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

export const AccentPlacement: StoryFn<typeof InteractableCard> = (args) => {
  const [placement, setPlacement] =
    useState<InteractableCardProps["accent"]>("bottom");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlacement(event.target.value as InteractableCardProps["accent"]);
  };
  return (
    <StackLayout style={{ width: "266px" }}>
      <InteractableCard {...args} accent={placement}>
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

export const Variant: StoryFn<typeof InteractableCard> = (args) => {
  const variants = ["primary", "secondary", "tertiary"] as const;
  return (
    <StackLayout style={{ width: "266px" }}>
      {variants.map((variant) => {
        return (
          <StackLayout align="end" key={variant}>
            <StackLayout direction="row" key={variant}>
              <InteractableCard {...args} variant={variant}>
                <StackLayout gap={1}>
                  <H3>Sustainable investing products</H3>
                  <Text>
                    We have a commitment to provide a wide range of investment
                    solutions to enable you to align your financial goals to
                    your values.
                  </Text>
                </StackLayout>
              </InteractableCard>
            </StackLayout>
            <Label>Variant: {variant}</Label>
          </StackLayout>
        );
      })}
    </StackLayout>
  );
};

export const InteractableCardGroupSingleSelect: StoryFn<
  typeof InteractableCard
> = (args) => (
  <InteractableCardGroup>
    <InteractableCard {...args} value="card" style={{ width: "180px" }}>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <CreditCardIcon aria-hidden size={2} />
          <H3>Credit Card</H3>
        </StackLayout>
        <Text>Link credit card to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard {...args} style={{ width: "180px" }} disabled>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <BankIcon aria-hidden size={2} />
          <H3 disabled>Bank wire</H3>
        </StackLayout>
        <Text disabled>Link your bank to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard {...args} value="crypto" style={{ width: "180px" }}>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <DiamondIcon aria-hidden size={2} />
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
  <InteractableCardGroup multiSelect>
    <InteractableCard {...args} value="card" style={{ width: "180px" }}>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <CreditCardIcon aria-hidden size={2} />
          <H3>Credit Card</H3>
        </StackLayout>
        <Text>Link credit card to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard {...args} style={{ width: "180px" }} disabled>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <BankIcon aria-hidden size={2} />
          <H3 disabled>Bank wire</H3>
        </StackLayout>
        <Text disabled>Link your bank to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
    <InteractableCard {...args} value="crypto" style={{ width: "180px" }}>
      <StackLayout gap={1}>
        <StackLayout gap={1} direction="row" align="center">
          <DiamondIcon aria-hidden size={2} />
          <H3>Cryptocurrency</H3>
        </StackLayout>
        <Text>Link your crypto to your payments account.</Text>
      </StackLayout>
    </InteractableCard>
  </InteractableCardGroup>
);

export const InteractableCardGroupRadio: StoryFn<typeof InteractableCard> = (
  args,
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
              <CreditCardIcon aria-hidden size={2} />
              <H3>Credit Card</H3>
            </StackLayout>
            <StackLayout direction="row" gap={1}>
              <RadioButtonIcon aria-hidden checked={selected === "card"} />
              <Text>Link credit card to your payments account.</Text>
            </StackLayout>
          </StackLayout>
        </InteractableCard>
        <InteractableCard value="wire" style={{ width: "180px" }}>
          <StackLayout gap={1}>
            <StackLayout gap={1} direction="row" align="center">
              <BankIcon aria-hidden size={2} />
              <H3>Bank wire</H3>
            </StackLayout>
            <StackLayout direction="row" gap={1}>
              <RadioButtonIcon aria-hidden checked={selected === "wire"} />
              <Text>Link your bank to your payments account.</Text>
            </StackLayout>
          </StackLayout>
        </InteractableCard>
        <InteractableCard value="crypto" style={{ width: "180px" }}>
          <StackLayout gap={1}>
            <StackLayout gap={1} direction="row" align="center">
              <DiamondIcon aria-hidden size={2} />
              <H3>Cryptocurrency</H3>
            </StackLayout>
            <StackLayout direction="row" gap={1}>
              <RadioButtonIcon aria-hidden checked={selected === "crypto"} />
              <Text>Link your crypto to your payments account.</Text>
            </StackLayout>
          </StackLayout>
        </InteractableCard>
      </InteractableCardGroup>
    </StackLayout>
  );
};

export const InteractableCardGroupCheckbox: StoryFn<typeof InteractableCard> = (
  args,
) => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <InteractableCardGroup
      onChange={(_event, value) => {
        setSelected(value);
      }}
      multiSelect
    >
      <InteractableCard {...args} value="jane-doe" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar aria-hidden size={1} />
            <H3>Jane Doe</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon
              aria-hidden
              checked={selected?.includes("jane-doe")}
            />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="tom-roberts" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar aria-hidden size={1} />
            <H3>Tom Roberts</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon
              aria-hidden
              checked={selected?.includes("tom-roberts")}
            />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="ray-smith" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar aria-hidden size={1} />
            <H3>Ray Smith</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <CheckboxIcon
              aria-hidden
              checked={selected?.includes("ray-smith")}
            />
            <Text>Add as business owner</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
    </InteractableCardGroup>
  );
};

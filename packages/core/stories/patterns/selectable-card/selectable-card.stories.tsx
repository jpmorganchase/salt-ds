import {
  H3,
  Text,
  StackLayout,
  InteractableCard,
  InteractableCardGroup,
  InteractableCardValue,
  Avatar,
  CheckboxIcon, Î
  RadioButtonIcon,
} from "@salt-ds/core";
import { CreditCardIcon, DiamondIcon, BankIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Patterns/Selectable Card",
} as Meta;

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
  args
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

import {
  H3,
  Text,
  StackLayout,
  InteractableCard,
  InteractableCardGroup,
  InteractableCardValue,
  Avatar,
  CheckboxIcon,
  RadioButtonIcon,
} from "@salt-ds/core";
import { CreditCardIcon, BankIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

import persona1 from "../../assets/avatar.png";
import persona2 from "../../assets/avatar2.png";
import persona3 from "../../assets/avatar3.png";

export default {
  title: "Patterns/Selectable Card",
} as Meta;

export const SingleSelection: StoryFn<typeof InteractableCard> = (args) => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <InteractableCardGroup
      onChange={(_event, value) => {
        setSelected(value);
      }}
    >
      <InteractableCard {...args} value="card" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <CreditCardIcon aria-hidden size={2} />
            <H3 style={{ margin: 0 }}>Credit Card</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <RadioButtonIcon aria-hidden checked={selected === "card"} />
            <Text>Make a payment by credit or debit card</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="wire" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <BankIcon aria-hidden size={2} />
            <H3 style={{ margin: 0 }}>Bank wire</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <RadioButtonIcon aria-hidden checked={selected === "wire"} />
            <Text>Make a payment by wire transfer</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
    </InteractableCardGroup>
  );
};

export const MultipleSelection: StoryFn<typeof InteractableCard> = (args) => {
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
            <Avatar aria-hidden size={1} src={persona1} />
            <H3 style={{ margin: 0 }}>Jane Doe</H3>
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
            <Avatar aria-hidden size={1} src={persona2} />
            <H3 style={{ margin: 0 }}>Tom Roberts</H3>
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
            <Avatar aria-hidden size={1} src={persona3} />
            <H3 style={{ margin: 0 }}>Ray Smith</H3>
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

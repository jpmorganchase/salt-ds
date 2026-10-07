import {
  H3,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardValue,
  RadioButtonIcon,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { BankIcon, CreditCardIcon } from "@salt-ds/icons";
import { useState } from "react";

export const SingleSelection = () => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <InteractableCardGroup
      onChange={(_event, value) => {
        setSelected(value);
      }}
    >
      <InteractableCard value="card" style={{ width: "180px" }}>
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

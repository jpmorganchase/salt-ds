import {
  Avatar,
  Banner,
  BannerContent,
  Card,
  Checkbox,
  CheckboxIcon,
  H3,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardValue,
  RadioButtonIcon,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { BankIcon, CreditCardIcon, DiamondIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { useState } from "react";

import persona1 from "../../assets/avatar.png";
import persona2 from "../../assets/avatar2.png";
import persona3 from "../../assets/avatar3.png";
import exampleImage from "../../assets/exampleImage1x.png";

export default {
  title: "Patterns/Selectable Card",
} as Meta;

export const SingleSelection: StoryFn<typeof InteractableCard> = (args) => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <InteractableCardGroup
      style={{ gap: "var(--salt-spacing-300)" }}
      onChange={(_event, value) => {
        setSelected(value);
      }}
    >
      <InteractableCard {...args} value="card" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <CreditCardIcon aria-hidden />
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
            <BankIcon aria-hidden />
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
      style={{ gap: "var(--salt-spacing-300)" }}
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

export const Image: StoryFn<typeof InteractableCard> = (args) => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <InteractableCardGroup
      onChange={(_event, value) => {
        setSelected(value);
      }}
    >
      <InteractableCard
        {...args}
        value="crypto"
        style={
          {
            "--saltInteractableCard-padding": 0,
            width: "260px",
          } as CSSProperties
        }
      >
        <img
          alt="example"
          src={exampleImage}
          style={{ display: "block", width: "100%" }}
        />
        <StackLayout gap={1} padding={2}>
          <H3 style={{ margin: 0 }}>Cryptocurrency</H3>
          <StackLayout direction="row" gap={1}>
            <RadioButtonIcon aria-hidden checked={selected === "crypto"} />
            <Text>Make a payment by crypto</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
    </InteractableCardGroup>
  );
};

export const Disabled: StoryFn<typeof InteractableCard> = (args) => {
  return (
    <InteractableCardGroup
      disabled
      style={{ gap: "var(--salt-spacing-300)" }}
      defaultValue="card"
    >
      <InteractableCard {...args} value="card" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <CreditCardIcon aria-hidden />
            <H3 style={{ margin: 0 }}>Credit Card</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <RadioButtonIcon aria-hidden checked />
            <Text>Make a payment by credit or debit card</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="wire" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <BankIcon aria-hidden />
            <H3 style={{ margin: 0 }}>Bank wire</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <RadioButtonIcon aria-hidden />
            <Text>Make a payment by wire transfer</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
      <InteractableCard value="crypto" style={{ width: "180px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <DiamondIcon aria-hidden />
            <H3 style={{ margin: 0 }}>Cryptocurrency</H3>
          </StackLayout>
          <StackLayout direction="row" gap={1}>
            <RadioButtonIcon aria-hidden />
            <Text>Make a payment by crypto</Text>
          </StackLayout>
        </StackLayout>
      </InteractableCard>
    </InteractableCardGroup>
  );
};

export const Validation: StoryFn<typeof InteractableCard> = (args) => {
  const [selected, setSelected] = useState<InteractableCardValue>();

  return (
    <StackLayout gap={2}>
      <Banner status="error">
        <BannerContent>
          A selection is required. Please choose an option
        </BannerContent>
      </Banner>
      <InteractableCardGroup
        style={{ gap: "var(--salt-spacing-300)" }}
        onChange={(_event, value) => {
          setSelected(value);
        }}
        multiSelect
      >
        <InteractableCard
          {...args}
          value="jane-doe"
          style={
            {
              "--saltInteractableCard-padding": 0,
              width: "180px",
            } as CSSProperties
          }
        >
          <StackLayout
            align="center"
            style={{ paddingTop: "var(--salt-spacing-200)" }}
          >
            <Avatar aria-hidden size={3} name="Jane Doe" src={persona1} />
          </StackLayout>
          <StackLayout gap={1} padding={2}>
            <H3 style={{ margin: 0 }}>Jane Doe</H3>
            <StackLayout direction="row" gap={1}>
              <CheckboxIcon
                aria-hidden
                checked={selected?.includes("jane-doe")}
              />
              <Text>Add as business owner</Text>
            </StackLayout>
          </StackLayout>
        </InteractableCard>
        <InteractableCard
          value="tom-roberts"
          style={
            {
              "--saltInteractableCard-padding": 0,
              width: "180px",
            } as CSSProperties
          }
        >
          <StackLayout
            align="center"
            style={{ paddingTop: "var(--salt-spacing-200)" }}
          >
            <Avatar aria-hidden size={3} name="Tom Roberts" src={persona2} />
          </StackLayout>
          <StackLayout gap={1} padding={2}>
            <H3 style={{ margin: 0 }}>Tom Roberts</H3>
            <StackLayout direction="row" gap={1}>
              <CheckboxIcon
                aria-hidden
                checked={selected?.includes("tom-roberts")}
              />
              <Text>Add as business owner</Text>
            </StackLayout>
          </StackLayout>
        </InteractableCard>
        <InteractableCard
          value="ray-smith"
          style={
            {
              "--saltInteractableCard-padding": 0,
              width: "180px",
            } as CSSProperties
          }
        >
          <StackLayout
            align="center"
            style={{ paddingTop: "var(--salt-spacing-200)" }}
          >
            <Avatar aria-hidden size={3} name="Ray Smith" src={persona3} />
          </StackLayout>
          <StackLayout gap={1} padding={2}>
            <H3 style={{ margin: 0 }}>Ray Smith</H3>
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
    </StackLayout>
  );
};

export const ReadOnly: StoryFn = () => {
  return (
    <StackLayout direction="row" gap={3}>
      <Card
        style={{
          width: "250px",
        }}
      >
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar aria-hidden size={1} src={persona1} />
            <H3 style={{ margin: 0 }}>Jane Doe</H3>
          </StackLayout>
          <Checkbox readOnly checked label="Add as business owner" />
        </StackLayout>
      </Card>
      <Card style={{ width: "250px" }}>
        <StackLayout gap={1}>
          <StackLayout gap={1} direction="row" align="center">
            <Avatar aria-hidden size={1} src={persona2} />
            <H3 style={{ margin: 0 }}>Tom Roberts</H3>
          </StackLayout>
          <Checkbox readOnly label="Add as business owner" />
        </StackLayout>
      </Card>
    </StackLayout>
  );
};

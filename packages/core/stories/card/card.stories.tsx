import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  type CardProps,
  FlexLayout,
  H3,
  Label,
  Link,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";
import exampleImage from "./../assets/exampleImage1x.png";

import "./card.stories.css";

export default {
  title: "Core/Card/Card",
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
    <img alt="example" src={exampleImage} />
    <CardContent>
      <StackLayout gap={1}>
        <H3>Sustainable investing products</H3>
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
      </StackLayout>
    </CardContent>
  </Card>
);

export const Sections: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "320px" }}>
    <CardHeader>
      <StackLayout gap={1}>
        <H3>Quarterly investment report</H3>
        <Text color="secondary">Updated 16 July 2026</Text>
      </StackLayout>
    </CardHeader>
    <CardContent>
      <Text>
        Review portfolio performance and the market changes that affected this
        quarter.
      </Text>
    </CardContent>
    <CardFooter>
      <Button>View report</Button>
    </CardFooter>
  </Card>
);

export const HeaderWithAction: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "320px" }}>
    <CardHeader>
      <FlexLayout align="start" gap={1} justify="space-between">
        <StackLayout gap={1}>
          <H3>Quarterly investment report</H3>
          <Text color="secondary">Updated 16 July 2026</Text>
        </StackLayout>
        <Button
          appearance="transparent"
          aria-label="Dismiss"
          sentiment="neutral"
        >
          <CloseIcon aria-hidden />
        </Button>
      </FlexLayout>
    </CardHeader>
    <CardContent>
      <Text>
        Review portfolio performance and the market changes that affected this
        quarter.
      </Text>
    </CardContent>
    <CardFooter>
      <Button>View report</Button>
    </CardFooter>
  </Card>
);

export const EqualHeightSections: StoryFn<typeof Card> = (args) => (
  <StackLayout align="stretch" direction="row" gap={2}>
    <Card {...args} style={{ width: "220px" }}>
      <CardHeader>
        <H3>Short report</H3>
      </CardHeader>
      <CardContent>
        <Text>A concise portfolio update.</Text>
      </CardContent>
      <CardFooter>
        <Button>View report</Button>
      </CardFooter>
    </Card>
    <Card {...args} style={{ width: "220px" }}>
      <CardHeader>
        <H3>Header and footer</H3>
      </CardHeader>
      <CardFooter>
        <Button>View report</Button>
      </CardFooter>
    </Card>
    <Card {...args} style={{ width: "220px" }}>
      <CardHeader>
        <H3>Longer report</H3>
      </CardHeader>
      <CardContent>
        <Text>
          A more detailed portfolio update containing additional supporting
          information.
        </Text>
      </CardContent>
      <CardFooter>
        <Button>View report</Button>
      </CardFooter>
    </Card>
  </StackLayout>
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
  const variants = ["primary", "secondary", "tertiary", "ghost"] as const;
  return (
    <StackLayout style={{ width: 600 }}>
      {variants.map((variant) => {
        return (
          <StackLayout align="end" key={variant}>
            <StackLayout direction="row">
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

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
import { useState } from "react";
import exampleImage from "./../assets/exampleImage1x.png";

import "./card.stories.css";

export default {
  title: "Core/Card/Card",
  component: Card,
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof Card>;

export const Default: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "260px" }}>
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

export const DefaultWithImage: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "260px" }}>
    <img aria-hidden alt="" src={exampleImage} />
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
      <StackLayout gap={0.5}>
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
      <Button>Open report</Button>
    </CardFooter>
  </Card>
);

export const HeaderWithAction: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "320px" }}>
    <CardHeader>
      <FlexLayout align="start" gap={1} justify="space-between">
        <StackLayout gap={0.5}>
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
      <Button>Open report</Button>
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
        <Button>Open report</Button>
      </CardFooter>
    </Card>
    <Card {...args} style={{ width: "220px" }}>
      <CardHeader>
        <H3>Header and footer</H3>
      </CardHeader>
      <CardFooter>
        <Button>Open report</Button>
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
        <Button>Open report</Button>
      </CardFooter>
    </Card>
  </StackLayout>
);

export const DefaultWithLink: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "260px" }}>
    <CardContent>
      <StackLayout gap={1}>
        <H3>Sustainable investing products</H3>
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
      </StackLayout>
    </CardContent>
    <CardFooter>
      <Link href="#" IconComponent={null}>
        View our range of funds
      </Link>
    </CardFooter>
  </Card>
);

export const DefaultWithButton: StoryFn<typeof Card> = (args) => (
  <Card {...args} style={{ width: "260px" }}>
    <CardContent>
      <StackLayout gap={1}>
        <H3>Sustainable investing products</H3>
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
      </StackLayout>
    </CardContent>
    <CardFooter>
      <Button>Open report</Button>
    </CardFooter>
  </Card>
);

export const AccentVariations: StoryFn<typeof Card> = (args) => {
  const [placement, setPlacement] = useState<CardProps["accent"]>("bottom");

  return (
    <StackLayout style={{ width: "266px" }}>
      <Card {...args} accent={placement} hoverable>
        <CardContent>
          <StackLayout gap={1}>
            <H3>Sustainable investing products</H3>
            <Text>
              We have a commitment to provide a wide range of investment
              solutions to enable you to align your financial goals to your
              values.
            </Text>
          </StackLayout>
        </CardContent>
      </Card>
      <RadioButtonGroup
        direction="horizontal"
        value={placement}
        onChange={(event) =>
          setPlacement(event.target.value as CardProps["accent"])
        }
      >
        <RadioButton key="bottom" label="bottom" value="bottom" />
        <RadioButton key="top" label="top" value="top" />
        <RadioButton key="left" label="left" value="left" />
        <RadioButton key="right" label="right" value="right" />
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
                <CardContent>
                  <StackLayout gap={1}>
                    <H3>Sustainable investing products</H3>
                    <Text>
                      We have a commitment to provide a wide range of investment
                      solutions to enable you to align your financial goals to
                      your values.
                    </Text>
                  </StackLayout>
                </CardContent>
              </Card>
            </StackLayout>
            <Label>Variant: {variant}</Label>
          </StackLayout>
        );
      })}
    </StackLayout>
  );
};

export const Appearance: StoryFn<typeof Card> = (args) => {
  const appearances = ["flat", "raised"] as const;
  return (
    <StackLayout direction="row">
      {appearances.map((appearance) => (
        <StackLayout align="end" key={appearance} style={{ width: "260px" }}>
          <Card {...args} appearance={appearance}>
            <CardContent>
              <StackLayout gap={1}>
                <H3>Sustainable investing products</H3>
                <Text>
                  We have a commitment to provide a wide range of investment
                  solutions to enable you to align your financial goals to your
                  values.
                </Text>
              </StackLayout>
            </CardContent>
          </Card>
          <Label>Appearance: {appearance}</Label>
        </StackLayout>
      ))}
    </StackLayout>
  );
};

export const BorderColor: StoryFn<typeof Card> = (args) => {
  const borderColors = ["strong", "default", "subtle", "none"] as const;
  return (
    <StackLayout direction="row">
      {borderColors.map((borderColor) => (
        <StackLayout align="end" key={borderColor} style={{ width: "260px" }}>
          <Card {...args} borderColor={borderColor}>
            <CardContent>
              <StackLayout gap={1}>
                <H3>Sustainable investing products</H3>
                <Text>
                  We have a commitment to provide a wide range of investment
                  solutions to enable you to align your financial goals to your
                  values.
                </Text>
              </StackLayout>
            </CardContent>
          </Card>
          <Label>Border color: {borderColor}</Label>
        </StackLayout>
      ))}
    </StackLayout>
  );
};

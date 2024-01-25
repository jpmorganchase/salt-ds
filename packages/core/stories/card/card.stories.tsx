import { ReactNode } from "react";
import { Meta, StoryFn } from "@storybook/react";
import {
  Button,
  Card,
  SaltProvider,
  Panel,
  H1,
  Text,
  FlexLayout,
  GridLayout,
  Link,
} from "@salt-ds/core";
import { ColumnLayoutContainer, ColumnLayoutItem } from "docs/story-layout";
import exampleImage from "./../assets/exampleImage1x.png";

import "./card.stories.css";

export default {
  title: "Core/Card",
  component: Card,
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof Card>;

interface ExampleRowProps {
  children: ReactNode;
  name: string;
}

const ExampleRow = ({ name, children }: ExampleRowProps) => (
  <Panel style={{ height: "unset", width: 800 }}>
    <ColumnLayoutContainer>
      <ColumnLayoutItem>
        <SaltProvider density="high">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        <SaltProvider density="medium">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        <SaltProvider density="low">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        <SaltProvider density="touch">{children}</SaltProvider>
      </ColumnLayoutItem>
    </ColumnLayoutContainer>
  </Panel>
);

const Examples = () => (
  <ExampleRow name="Sustainable investing products">
    <Card>
      <Text>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
    </Card>
  </ExampleRow>
);

export const AllDefault: StoryFn<typeof Card> = () => (
  <div>
    <SaltProvider mode="light">
      <Examples />
    </SaltProvider>
    <SaltProvider mode="dark">
      <Examples />
    </SaltProvider>
  </div>
);

const exampleData = [
  {
    title: "Sustainable investing products",
    content:
      "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
  },
  {
    title: "Our expertise",
    content:
      "Our team of more than 200 experts in 28 offices worldwide is on hand to help you with your investment decisions.",
  },
  {
    title: "Market-leading insights",
    content:
      "Our award-winning strategists provide unique and regular insights about market events and current trends.",
  },
  {
    title: "Events",
    content:
      "We have a full calendar of online and in-person events with expert guest speakers for you to attend.",
  },
];

export const Default: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <H1 styleAs="h3">{exampleData[0].title}</H1>
    <Text>{exampleData[0].content}</Text>
  </Card>
);

export const CardsInFlexLayout: StoryFn<typeof Card> = () => (
  <FlexLayout>
    {exampleData.map((example, index) => {
      return (
        <Card key={index}>
          <H1 styleAs="h3">{example.title}</H1>
          <Text>{example.content}</Text>
        </Card>
      );
    })}
  </FlexLayout>
);

export const CardsInGridLayout: StoryFn<typeof Card> = () => (
  <GridLayout style={{ maxWidth: "700px" }} rows={2} columns={2}>
    {exampleData.map((example, index) => {
      return (
        <Card key={index}>
          <H1 styleAs="h3">{example.title}</H1>
          <Text>{example.content}</Text>
        </Card>
      );
    })}
  </GridLayout>
);

export const DefaultWithImage: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <img
      alt=""
      src={exampleImage}
      className="card-demo-image"
      style={{ width: "-webkit-fill-available" }}
    />
    <H1 styleAs="h3">{exampleData[0].title}</H1>
    <Text>{exampleData[0].content}</Text>
  </Card>
);

export const DefaultWithLink: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
      <H1 styleAs="h3">{exampleData[0].title}</H1>
      <Text>{exampleData[0].content}</Text>
    </div>
    <Link href="#" IconComponent={null} target="_blank">
      View our range of funds
    </Link>
  </Card>
);

export const DefaultWithLinkAndImage: StoryFn<typeof Card> = () => (
  <Card className="withImage">
    <img
      aria-label="The Skies by Dominik Schröder"
      src={exampleImage}
      className="card-demo-image"
      style={{ width: "-webkit-fill-available" }}
    />
    <div
      style={{
        padding:
          "0px var(--salt-size-container-spacing) var(--salt-size-container-spacing) var(--salt-size-container-spacing)",
      }}
    >
      <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
        <H1 styleAs="h3">{exampleData[0].title}</H1>
        <Text>{exampleData[0].content}</Text>
      </div>
      <Link href="#" IconComponent={null} target="_blank">
        View our range of funds
      </Link>
    </div>
  </Card>
);

export const DefaultWithButton: StoryFn<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
      <H1 styleAs="h3">{exampleData[0].title}</H1>
      <Text>{exampleData[0].content}</Text>
    </div>
    <Button onClick={() => window.open("#")}>View funds</Button>
  </Card>
);

export const DefaultWithButtonAndImage: StoryFn<typeof Card> = () => (
  <Card className="withImage">
    <img
      aria-label="The Skies by Dominik Schröder"
      src={exampleImage}
      className="card-demo-image"
      style={{ width: "-webkit-fill-available" }}
    />
    <div
      style={{
        padding:
          "0px var(--salt-size-container-spacing) var(--salt-size-container-spacing) var(--salt-size-container-spacing)",
      }}
    >
      <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
        <H1 styleAs="h3">{exampleData[0].title}</H1>
        <Text>{exampleData[0].content}</Text>
      </div>
      <Button onClick={() => window.open("#")}>View funds</Button>
    </div>
  </Card>
);

export const DefaultAsLink: StoryFn<typeof Card> = () => (
  <Link
    style={{ textDecoration: "none" }}
    href="#"
    IconComponent={null}
    target="_blank"
  >
    <Card className="withImage" interactable>
      <img
        aria-label="The Skies by Dominik Schröder"
        src={exampleImage}
        className="card-demo-image"
        style={{ width: "-webkit-fill-available" }}
      />
      <div
        style={{
          padding:
            "0px var(--salt-size-container-spacing) var(--salt-size-container-spacing) var(--salt-size-container-spacing)",
        }}
      >
        <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
          <H1 styleAs="h3">{exampleData[0].title}</H1>
          <Text>{exampleData[0].content}</Text>
        </div>
        <Text>View our range of funds</Text>
      </div>
    </Card>
  </Link>
);

export const DefaultDisabled: StoryFn<typeof Card> = () => (
  <Card className="withImage" disabled>
    <img
      aria-label="The Skies by Dominik Schröder"
      src={exampleImage}
      className="card-demo-image"
      style={{ width: "-webkit-fill-available" }}
    />
    <div
      style={{
        padding:
          "0px var(--salt-size-container-spacing) var(--salt-size-container-spacing) var(--salt-size-container-spacing)",
      }}
    >
      <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
        <H1 styleAs="h3">{exampleData[0].title}</H1>
        <Text>{exampleData[0].content}</Text>
      </div>
      <Text>View our range of funds</Text>
    </div>
  </Card>
);

import { ReactNode } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  Button,
  Card,
  InteractableCard,
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
} as ComponentMeta<typeof Card>;

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
  <ExampleRow name="Default">
    <Card>
      <Text>Content</Text>
    </Card>
  </ExampleRow>
);

const InteractableExamples = () => (
  <ExampleRow name="Default">
    <InteractableCard>
      <Text>Content</Text>
    </InteractableCard>
  </ExampleRow>
);

export const AllDefault: ComponentStory<typeof Card> = () => (
  <div>
    <SaltProvider mode="light">
      <Examples />
    </SaltProvider>
    <SaltProvider mode="dark">
      <Examples />
    </SaltProvider>
  </div>
);

export const Default: ComponentStory<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <H1 styleAs="h3">Card</H1>
    <Text>
      A card displays information about a single subject, and acts as entry
      point to more detailed information.
    </Text>
  </Card>
);

export const CardsInFlexLayout: ComponentStory<typeof Card> = () => (
  <FlexLayout>
    {Array.from({ length: 4 }, (_, index) => (
      <Card key={index}>
        <H1 styleAs="h3">Card</H1>
        <Text>
          A card displays information about a single subject, and acts as entry
          point to more detailed information.
        </Text>
      </Card>
    ))}
  </FlexLayout>
);

export const CardsInGridLayout: ComponentStory<typeof Card> = () => (
  <GridLayout style={{ maxWidth: "700px" }} rows={2} columns={2}>
    {Array.from({ length: 4 }, (_, index) => (
      <Card key={index}>
        <H1 styleAs="h3">Card</H1>
        <Text>
          A card displays information about a single subject, and acts as entry
          point to more detailed information.
        </Text>
      </Card>
    ))}
  </GridLayout>
);

export const DefaultWithImage: ComponentStory<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <img
      alt=""
      src={exampleImage}
      className="card-demo-image"
      style={{ width: "-webkit-fill-available" }}
    />
    <H1 styleAs="h3">Card</H1>
    <Text>
      A card displays information about a single subject, and acts as entry
      point to more detailed information.
    </Text>
  </Card>
);

export const DefaultWithLink: ComponentStory<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
      <H1 styleAs="h3">Card</H1>
      <Text>
        A card displays information about a single subject, and acts as entry
        point to more detailed information.
      </Text>
    </div>
    <Link
      href="https://www.figma.com/@jpmorgan_salt"
      IconComponent={null}
      target="_blank"
    >
      Visit Specs
    </Link>
  </Card>
);

export const DefaultWithLinkAndImage: ComponentStory<typeof Card> = () => (
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
        <H1 styleAs="h3">Card</H1>
        <Text>
          A card displays information about a single subject, and acts as entry
          point to more detailed information.
        </Text>
      </div>
      <Link
        href="https://www.figma.com/@jpmorgan_salt"
        IconComponent={null}
        target="_blank"
      >
        Visit Specs
      </Link>
    </div>
  </Card>
);

export const DefaultWithButton: ComponentStory<typeof Card> = () => (
  <Card style={{ width: "256px" }}>
    <div style={{ paddingBottom: "var(--salt-size-unit)" }}>
      <H1 styleAs="h3">Card</H1>
      <Text>
        A card displays information about a single subject, and acts as entry
        point to more detailed information.
      </Text>
    </div>
    <Button onClick={() => window.open("https://www.figma.com/@jpmorgan_salt")}>
      Visit Specs
    </Button>
  </Card>
);

export const DefaultWithButtonAndImage: ComponentStory<typeof Card> = () => (
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
        <H1 styleAs="h3">Card</H1>
        <Text>
          A card displays information about a single subject, and acts as entry
          point to more detailed information.
        </Text>
      </div>
      <Button
        onClick={() => window.open("https://www.figma.com/@jpmorgan_salt")}
      >
        Visit Specs
      </Button>
    </div>
  </Card>
);

export const InteractableAll: ComponentStory<typeof Card> = () => (
  <div>
    <SaltProvider mode="light">
      <InteractableExamples />
    </SaltProvider>
    <SaltProvider mode="dark">
      <InteractableExamples />
    </SaltProvider>
  </div>
);

export const Interactable: ComponentStory<typeof Card> = () => (
  <InteractableCard style={{ width: "256px" }}>
    <H1 styleAs="h3">Card</H1>
    <Text>An entry point to more detailed information.</Text>
  </InteractableCard>
);

export const InteractableDisabled: ComponentStory<typeof Card> = () => (
  <InteractableCard
    style={{ width: "256px" }}
    onClick={() => console.log("Clicked")}
    data-testid="card-disabled-example"
    disabled
  >
    <H1 styleAs="h3" disabled>
      Card
    </H1>
    <Text disabled>This component has been disabled.</Text>
  </InteractableCard>
);

export const InteractableAccentVariations: ComponentStory<typeof Card> = () => (
  <div
    style={{
      display: "grid",
      gap: "calc(2 * var(--salt-size-unit))",
      width: "266px",
    }}
  >
    <InteractableCard>
      <H1 styleAs="h3">Card</H1>
      <Text>
        A card displays information about a single subject, and acts as entry
        point to more detailed information.
      </Text>
    </InteractableCard>
    <InteractableCard accentPlacement="left">
      <H1 styleAs="h3">Card</H1>
      <Text>
        A card displays information about a single subject, and acts as entry
        point to more detailed information.
      </Text>
    </InteractableCard>
    <InteractableCard accentPlacement="top">
      <H1 styleAs="h3">Card</H1>
      <Text>
        A card displays information about a single subject, and acts as entry
        point to more detailed information.
      </Text>
    </InteractableCard>
    <InteractableCard accentPlacement="right">
      <H1 styleAs="h3">Card</H1>
      <Text>
        A card displays information about a single subject, and acts as entry
        point to more detailed information.
      </Text>
    </InteractableCard>
  </div>
);

export const InteractableAsBlockLink: ComponentStory<typeof Card> = () => {
  return (
    <Link
      style={{ textDecoration: "none" }}
      href="https://saltdesignsystem.com/"
      IconComponent={null}
      target="_blank"
    >
      <InteractableCard style={{ width: "266px" }}>
        <H1 styleAs="h3">Card</H1>
        <Text>
          A card displays information about a single subject, and acts as entry
          point to more detailed information.
        </Text>
      </InteractableCard>
    </Link>
  );
};

export const InteractableAsBlockLinkWithImage: ComponentStory<
  typeof Card
> = () => {
  return (
    <Link
      style={{ textDecoration: "none" }}
      href="https://saltdesignsystem.com/"
      IconComponent={null}
      target="_blank"
    >
      <InteractableCard className="withImage">
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
          <H1 styleAs="h3">Card</H1>
          <Text>
            A card displays information about a single subject, and acts as
            entry point to more detailed information.
          </Text>
        </div>
      </InteractableCard>
    </Link>
  );
};

export const InteractableAsBlockLinkWithImageBackground: ComponentStory<
  typeof Card
> = () => {
  return (
    <Link
      style={{ textDecoration: "none" }}
      href="https://saltdesignsystem.com/"
      IconComponent={null}
      target="_blank"
    >
      <InteractableCard className="imageBackground">
        <div
          style={{ paddingTop: "calc(3 * var(--salt-size-container-spacing))" }}
        >
          <H1 styleAs="h3">Card</H1>
          <Text>
            A card displays information about a single subject, and acts as
            entry point to more detailed information.
          </Text>
        </div>
      </InteractableCard>
    </Link>
  );
};

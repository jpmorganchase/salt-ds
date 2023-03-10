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
  H2,
  GridLayout,
  Label,
} from "@salt-ds/core";
import { ColumnLayoutContainer, ColumnLayoutItem } from "docs/story-layout";
import stockPhoto from "./../assets/stockPhoto.png";

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
  <>
    <ExampleRow name="Default">
      <Card>
        <Text>Content</Text>
      </Card>
    </ExampleRow>
  </>
);

export const All: ComponentStory<typeof Card> = () => (
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
  <Card>
    <div>
      <H1>This is Card</H1>
      <Text>Using Nested DOM Elements</Text>
    </div>
  </Card>
);

export const CardsInFlexLayout: ComponentStory<typeof Card> = () => (
  <FlexLayout>
    {Array.from({ length: 4 }, (_, index) => (
      <Card key={index}>
        <div>
          <H1>This is Card</H1>
          {index % 2 === 0 && <H2>With a bit more information...</H2>}
          <Text>Seen in FlexLayout</Text>
        </div>
      </Card>
    ))}
  </FlexLayout>
);

export const CardsInGridLayout: ComponentStory<typeof Card> = () => (
  <GridLayout style={{ maxWidth: "700px" }} rows={2} columns={2}>
    <Default />
    <InteractableAsLink />
    <WithImageAndButton />
    <InteractableDisabled />
  </GridLayout>
);

export const InteractableAsLink: ComponentStory<typeof Card> = () => {
  return (
    <a href="https://saltdesignsystem.com/" tabIndex={0}>
      <InteractableCard>
        <div style={{ textAlign: "center" }}>
          <div>Visit Salt</div>
        </div>
      </InteractableCard>
    </a>
  );
};

// export const InteractableAsAction: ComponentStory<typeof Card> = () => {
//   const handleClick = () => {
//     console.log("Clicked");
//   };

//   return (
//     <InteractableCard onClick={handleClick} tabIndex={0}>
//       <div style={{ textAlign: "center" }}>
//         <div>Click me</div>
//       </div>
//     </InteractableCard>
//   );
// };

export const InteractableDisabled: ComponentStory<typeof Card> = () => (
  <InteractableCard
    onClick={() => console.log("Clicked")}
    data-testid="card-disabled-example"
    disabled
  >
    <div>
      <H1 disabled>Interactable Card</H1>
      <Text disabled>This Card has been disabled</Text>
    </div>
  </InteractableCard>
);

export const WithImageAndButton: ComponentStory<typeof Card> = () => (
  <Card>
    <img
      src={stockPhoto}
      alt="Image from unsplash"
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        paddingBottom: "var(--salt-size-unit)",
      }}
    />
    <div
      style={{
        borderTop:
          "var(--salt-size-border) var(--salt-separable-borderStyle) var(--salt-separable-tertiary-borderColor)",
        display: "grid",
        gridTemplateColumns: "repeat(2, auto)",
        gap: "calc(var(--salt-size-unit) * 2)",
        alignItems: "center",
        padding:
          "var(--salt-size-unit) var(--salt-size-unit) 0 var(--salt-size-unit)",
      }}
    >
      <div
        style={{
          display: "grid",
          alignItems: "flex-start",
          gap: "var(--salt-size-unit)",
        }}
      >
        <Label>
          <strong>The Skies</strong>
        </Label>
        <Label>Art by Dominik Schröder</Label>
      </div>
      <Button onClick={() => console.log("Clicked")}>See more</Button>
    </div>
  </Card>
);

export const Variations: ComponentStory<typeof Card> = () => (
  <div style={{display: "grid", gap: "calc(2 * var(--salt-size-unit))"}}>
    <InteractableCard>
      <div>
        <H1 style={{margin: "0"}}>This is Card</H1>
        <Text>Using Nested DOM Elements</Text>
      </div>
    </InteractableCard>
    <InteractableCard accentPosition="left">
      <div>
        <H1 style={{margin: "0"}}>This is Card</H1>
        <Text>Using Nested DOM Elements</Text>
      </div>
    </InteractableCard>
    <InteractableCard accentPosition="top">
      <div>
        <H1 style={{margin: "0"}}>This is Card</H1>
        <Text>Using Nested DOM Elements</Text>
      </div>
    </InteractableCard>
  </div>
);
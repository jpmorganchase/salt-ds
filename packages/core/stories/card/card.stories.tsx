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
import { SearchIcon } from "@salt-ds/icons";
import { ColumnLayoutContainer, ColumnLayoutItem } from "docs/story-layout";
import stockPhoto from "./../assets/stockPhoto.png";

export default {
  title: "Core/Card",
  component: Card,
} as ComponentMeta<typeof Card>;

interface ExampleRowProps {
  children: ReactNode;
  name: string;
}

const ExampleRow = ({ name, children }: ExampleRowProps) => (
  <Panel style={{ height: "unset", width: 800 }}>
    <ColumnLayoutContainer>
      <ColumnLayoutItem>
        <SaltProvider density="touch">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        <SaltProvider density="low">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        <SaltProvider density="medium">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        <SaltProvider density="high">{children}</SaltProvider>
      </ColumnLayoutItem>
    </ColumnLayoutContainer>
  </Panel>
);

const Examples = () => (
  <>
    <ExampleRow name="Default">
      <Card>
        <div>
          <H1>Card with Density</H1>
          <Text>Here is some content</Text>
        </div>
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
  <GridLayout rows={2} columns={2}>
    <Default />
    <WithImage />
    <WithImage />
    <InteractableDisabled />
  </GridLayout>
);

export const Interactable: ComponentStory<typeof Card> = () => (
  <InteractableCard
    onClick={() => {
      window.open("https://google.com");
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div>Visit Google</div>
    </div>
  </InteractableCard>
);

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

export const WithImage: ComponentStory<typeof Card> = () => (
  <Card>
    <img src={stockPhoto} alt="Image from unsplash" height={150} />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "var(--salt-size-unit)",
      }}
    >
      <Label>The Skies</Label>
      <Button onClick={() => console.log("Clicked")}>See more</Button>
    </div>
  </Card>
);

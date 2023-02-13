import { ReactNode } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Card, Link, SaltProvider, Panel, H1 } from "@salt-ds/core";
import { ColumnLayoutContainer, ColumnLayoutItem } from "docs/story-layout";

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
    <h1>{name} - ( Touch, Low, Medium, High )</h1>
    <ColumnLayoutContainer>
      <ColumnLayoutItem>
        Touch
        <SaltProvider density="touch">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        Low
        <SaltProvider density="low">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        Medium
        <SaltProvider density="medium">{children}</SaltProvider>
      </ColumnLayoutItem>
      <ColumnLayoutItem>
        High
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
          <H1>
            Card with Density
          </H1>
          <span>Here is some content</span>
        </div>
      </Card>
    </ExampleRow>
  </>
);

export const All: ComponentStory<typeof Card> = () => (
  <div style={{ marginTop: -200 }}>
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
      <span>Using Nested DOM Elements</span>
    </div>
  </Card>
);

export const Disabled: ComponentStory<typeof Card> = () => (
  <Card data-testid="card-disabled-example" disabled>
    <div>
      <H1>Disabled Card</H1>
      <span>Here is some content</span>
    </div>
  </Card>
);

export const Interactable: ComponentStory<typeof Card> = () => (
  <Link
    href="https://google.com"
    style={{ display: "inline-block", textDecoration: "none" }}
    tab-index="0"
    target="_parent"
  >
    <Card interactable>
      <div>
        <p>Visit Google</p>
      </div>
    </Card>
  </Link>
);

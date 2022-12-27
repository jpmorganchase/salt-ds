import { ReactNode } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Card, Link, SaltProvider, Panel } from "@salt-ds/core";
import { ColumnLayoutContainer, ColumnLayoutItem } from "docs/story-layout";

export default {
  title: "Core/Card",
  component: Card,
} as Meta<typeof Card>;

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
          <h1 style={{ margin: "0", lineHeight: "1.3em" }}>
            Card with Density
          </h1>
          <span>Here is some content</span>
        </div>
      </Card>
    </ExampleRow>
  </>
);

export const All: StoryFn<typeof Card> = () => (
  <div style={{ marginTop: -200 }}>
    <SaltProvider mode="light">
      <Examples />
    </SaltProvider>
    <SaltProvider mode="dark">
      <Examples />
    </SaltProvider>
  </div>
);

export const Default: StoryFn<typeof Card> = () => (
  <Card>
    <div>
      <h1>This is Card</h1>
      <span>Using Nested DOM Elements</span>
    </div>
  </Card>
);

export const Disabled: StoryFn<typeof Card> = () => (
  <Card data-testid="card-disabled-example" disabled>
    <div>
      <h1>Disabled Card</h1>
      <span>Here is some content</span>
    </div>
  </Card>
);

export const Interactable: StoryFn<typeof Card> = () => (
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

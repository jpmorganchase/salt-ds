import { Banner, FlowLayout, StackLayout } from "@salt-ds/core";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import { GhostButton, SystemStatus } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/GhostButton",
  component: GhostButton,
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof GhostButton>;

export const TestingEverything: StoryFn<typeof GhostButton> = (props) => {
  return (
    <StackLayout>
      <div style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </div>
      <Banner status="success" style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </Banner>
      <Banner status="error" style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </Banner>
      <Banner status="info" style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </Banner>
      <Banner status="warning" style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </Banner>
      <Banner variant="secondary" status="success" style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </Banner>
      <Banner variant="secondary" status="error" style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </Banner>
      <Banner variant="secondary" status="info" style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </Banner>
      <Banner variant="secondary" status="warning" style={{ width: 500 }}>
        <GhostButton aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </Banner>
      <div style={{ width: 500 }}>
        <GhostButton disabled aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </div>
      <SystemStatus status="success" style={{ width: 500 }}>
        <GhostButton adaptiveAppearance="solid" aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </SystemStatus>
      <SystemStatus status="error" style={{ width: 500 }}>
        <GhostButton adaptiveAppearance="solid" aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </SystemStatus>
      <SystemStatus status="info" style={{ width: 500 }}>
        <GhostButton adaptiveAppearance="solid" aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </SystemStatus>
      <SystemStatus status="warning" style={{ width: 500 }}>
        <GhostButton adaptiveAppearance="solid" aria-label="Search" {...props}>
          <CloseIcon aria-hidden /> Button
        </GhostButton>
      </SystemStatus>
    </StackLayout>
  );
};

const ButtonGridTemplate: StoryFn<typeof GhostButton> = (props) => {
  return (
    <FlowLayout>
      <GhostButton {...props}>Submit</GhostButton>
      <GhostButton aria-label="Search" {...props}>
        <SearchIcon aria-hidden />
      </GhostButton>
      <GhostButton {...props}>
        <SearchIcon aria-hidden /> Search
      </GhostButton>
      <Banner status="info">
        <GhostButton {...props}>Submit</GhostButton>
        <GhostButton aria-label="Search" {...props}>
          <SearchIcon aria-hidden />
        </GhostButton>
        <GhostButton {...props}>
          <SearchIcon aria-hidden /> Search
        </GhostButton>
      </Banner>
      <SystemStatus status="info">
        <GhostButton {...props}>Submit</GhostButton>
        <GhostButton aria-label="Search" {...props}>
          <SearchIcon aria-hidden />
        </GhostButton>
        <GhostButton {...props}>
          <SearchIcon aria-hidden /> Search
        </GhostButton>
      </SystemStatus>
    </FlowLayout>
  );
};

export const Disabled: StoryFn = (props) => {
  return (
    <StackLayout gap={3}>
      <FlowLayout>
        <GhostButton disabled>Submit</GhostButton>
        <GhostButton aria-label="Search" disabled>
          <SearchIcon aria-hidden />
        </GhostButton>
        <GhostButton disabled>
          <SearchIcon aria-hidden /> Search
        </GhostButton>
        <Banner status="info">
          <GhostButton disabled>Submit</GhostButton>
          <GhostButton aria-label="Search" disabled>
            <SearchIcon aria-hidden />
          </GhostButton>
          <GhostButton disabled>
            <SearchIcon aria-hidden /> Search
          </GhostButton>
        </Banner>
        <SystemStatus status="info">
          <GhostButton disabled>Submit</GhostButton>
          <GhostButton aria-label="Search" disabled>
            <SearchIcon aria-hidden />
          </GhostButton>
          <GhostButton disabled>
            <SearchIcon aria-hidden /> Search
          </GhostButton>
        </SystemStatus>
      </FlowLayout>
      <FlowLayout>
        <GhostButton adaptiveAppearance="solid" disabled>
          Submit
        </GhostButton>
        <GhostButton adaptiveAppearance="solid" aria-label="Search" disabled>
          <SearchIcon aria-hidden />
        </GhostButton>
        <GhostButton adaptiveAppearance="solid" disabled>
          <SearchIcon aria-hidden /> Search
        </GhostButton>
        <Banner status="info">
          <GhostButton adaptiveAppearance="solid" disabled>
            Submit
          </GhostButton>
          <GhostButton adaptiveAppearance="solid" aria-label="Search" disabled>
            <SearchIcon aria-hidden />
          </GhostButton>
          <GhostButton adaptiveAppearance="solid" disabled>
            <SearchIcon aria-hidden /> Search
          </GhostButton>
        </Banner>
        <SystemStatus status="info">
          <GhostButton adaptiveAppearance="solid" disabled>
            Submit
          </GhostButton>
          <GhostButton adaptiveAppearance="solid" aria-label="Search" disabled>
            <SearchIcon aria-hidden />
          </GhostButton>
          <GhostButton adaptiveAppearance="solid" disabled>
            <SearchIcon aria-hidden /> Search
          </GhostButton>
        </SystemStatus>
      </FlowLayout>
    </StackLayout>
  );
};

export const Solid = ButtonGridTemplate.bind({});
Solid.args = {
  adaptiveAppearance: "solid",
};

export const NonSolid = ButtonGridTemplate.bind({});
NonSolid.args = {
  adaptiveAppearance: "non-solid",
};

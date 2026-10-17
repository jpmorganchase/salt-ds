import {
  Button,
  ComboBox,
  Input,
  Kbd,
  LinkButton,
  NumberInput,
  OnSolidButton,
  Option,
  Pagination,
  Paginator,
  Pill,
  Tag,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import type { CSSProperties, ReactNode } from "react";

export default {
  title: "Core/Salt Provider/Content Sizing QA",
} as Meta;

const LONG_LABEL = "Submit application form now";

// Doubles the medium density text size, like a browser's text-only zoom.
const enlargedText = {
  "--salt-text-fontSize": "24px",
  "--salt-text-lineHeight": "32px",
} as CSSProperties;

const Narrow = ({ children }: { children: ReactNode }) => (
  <div style={{ width: 90 }}>{children}</div>
);

export const WrappedLabels: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={5} itemPadding={4} {...props}>
    <Narrow>
      <Button>{LONG_LABEL}</Button>
    </Narrow>
    <Narrow>
      <LinkButton href="#">{LONG_LABEL}</LinkButton>
    </Narrow>
    <Narrow>
      <ToggleButton value="toggle">{LONG_LABEL}</ToggleButton>
    </Narrow>
    <Narrow>
      <ToggleButtonGroup>
        <ToggleButton value="long">{LONG_LABEL}</ToggleButton>
      </ToggleButtonGroup>
    </Narrow>
    <Narrow>
      <OnSolidButton>{LONG_LABEL}</OnSolidButton>
    </Narrow>
  </QAContainer>
);

WrappedLabels.parameters = {
  chromatic: { disableSnapshot: false },
};

export const EnlargedText: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={4} itemPadding={4} {...props}>
    <div style={enlargedText}>
      <Button>Submit</Button>
    </div>
    <div style={enlargedText}>
      <LinkButton href="#">Submit</LinkButton>
    </div>
    <div style={enlargedText}>
      <ToggleButtonGroup>
        <ToggleButton value="one">One</ToggleButton>
        <ToggleButton value="two">Two</ToggleButton>
      </ToggleButtonGroup>
    </div>
    <div style={enlargedText}>
      <OnSolidButton>Submit</OnSolidButton>
    </div>
    <div style={enlargedText}>
      <Pill>Pill</Pill>
    </div>
    <div style={enlargedText}>
      <Tag>Tag</Tag>
    </div>
    <div style={enlargedText}>
      <Kbd>Ctrl</Kbd>
    </div>
    <div style={enlargedText}>
      <Pagination count={5}>
        <Paginator />
      </Pagination>
    </div>
    <div style={enlargedText}>
      <Input defaultValue="Value" />
    </div>
    <div style={enlargedText}>
      <NumberInput defaultValue={5} />
    </div>
    <div style={enlargedText}>
      <ComboBox multiselect truncate defaultSelected={["One", "Two"]}>
        <Option value="One" />
        <Option value="Two" />
      </ComboBox>
    </div>
  </QAContainer>
);

EnlargedText.parameters = {
  chromatic: { disableSnapshot: false },
};

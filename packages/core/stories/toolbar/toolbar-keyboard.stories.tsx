import { Toolbar } from "@salt-ds/core";
import type { Meta } from "@storybook/react-vite";

import {
  KeyboardButtonsFixture,
  KeyboardComboBoxFixture,
  KeyboardDatePickerFixture,
  KeyboardOverflowFixture,
  KeyboardRtlFixture,
  KeyboardTextInputFixture,
  KeyboardToggleGroupFixture,
} from "./toolbar.cypress.stories";

export default {
  title: "Core/Toolbar/Keyboard",
  component: Toolbar,
  parameters: {
    layout: "padded",
  },
} as Meta<typeof Toolbar>;

export const EntryAndWrap = () => <KeyboardButtonsFixture width={560} />;

export const TextInputBoundary = () => <KeyboardTextInputFixture width={620} />;

export const ComboBoxBoundary = () => <KeyboardComboBoxFixture width={620} />;

export const DatePickerBoundary = () => (
  <KeyboardDatePickerFixture width={720} />
);

export const ToggleGroupBoundary = () => (
  <KeyboardToggleGroupFixture width={680} />
);

export const OverflowPanelNavigation = () => (
  <KeyboardOverflowFixture width={420} />
);

export const RightToLeftNavigation = () => <KeyboardRtlFixture width={560} />;

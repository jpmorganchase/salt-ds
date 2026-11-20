import {
  Button,
  Dropdown,
  Input,
  ListBox,
  MultilineInput,
  NumberInput,
  Option,
  StackLayout,
  Tag,
  Text,
} from "@salt-ds/core";
import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useMemo, useState } from "react";

export default {
  title: "Styles/Component Defaults",
  parameters: {
    layout: "padded",
  },
} as Meta;

const dropdownOptions = ["Alpha", "Beta", "Gamma"];

const borderedDefaultsRegistry: ComponentDefaultsRegistry = {
  saltDropdown: { props: { bordered: true } },
  saltInput: { props: { bordered: true } },
  saltListBox: { props: { bordered: true } },
  saltMultilineInput: { props: { bordered: true } },
  saltNumberInput: { props: { bordered: true } },
  saltTag: { props: { bordered: true } },
};

export const BorderedDefaultsToggle: StoryFn = () => {
  const [applyBorderedDefaults, setApplyBorderedDefaults] = useState(false);

  const registry = useMemo(
    () => (applyBorderedDefaults ? borderedDefaultsRegistry : undefined),
    [applyBorderedDefaults],
  );

  return (
    <StackLayout gap={1.5} style={{ maxWidth: 720 }}>
      <StackLayout align="center" direction="row" gap={1}>
        <Button onClick={() => setApplyBorderedDefaults((value) => !value)}>
          {applyBorderedDefaults
            ? "Unset provider defaults"
            : "Set provider defaults"}
        </Button>
        <Text color="secondary">
          Provider bordered defaults: {applyBorderedDefaults ? "ON" : "OFF"}
        </Text>
      </StackLayout>

      <ComponentDefaultsProvider value={registry}>
        <StackLayout gap={1}>
          <Input placeholder="Input" />

          <NumberInput defaultValue={42} placeholder="NumberInput" />

          <Dropdown placeholder="Dropdown">
            {dropdownOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Dropdown>

          <ListBox>
            {dropdownOptions.map((option) => (
              <Option key={`list-${option}`} value={option}>
                {option}
              </Option>
            ))}
          </ListBox>

          <MultilineInput placeholder="MultilineInput" />
          <Tag>Tag</Tag>
        </StackLayout>
      </ComponentDefaultsProvider>
    </StackLayout>
  );
};

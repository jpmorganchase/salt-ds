import type { Meta, StoryFn } from "@storybook/react";
import { ListBox, Option, OptionGroup } from "@salt-ds/core";
import { usStateExampleData } from "../assets/exampleData";
import "./list-box.stories.css";

const shortStatesData = usStateExampleData.slice(0, 4);

function groupByFirstLetter(data: typeof usStateExampleData) {
  return data.reduce((acc, option) => {
    const groupName = option[0];
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(option);
    return acc;
  }, {} as Record<string, typeof usStateExampleData>);
}

export default {
  title: "Core/List box",
  component: ListBox,
} as Meta<typeof ListBox>;

const Template: StoryFn<typeof ListBox> = (args) => (
  <ListBox
    {...args}
    style={{
      maxHeight: "",
    }}
  >
    {shortStatesData.map((state) => (
      <Option key={state} value={state} />
    ))}
  </ListBox>
);

export const SingleSelect = Template.bind({});

export const Multiselect = Template.bind({});
Multiselect.args = {
  multiselect: true,
};

export const Grouped: StoryFn<typeof ListBox> = (args) => (
  <ListBox
    {...args}
    style={{
      maxHeight: "calc((var(--salt-size-base) + var(--salt-spacing-100)) * 10)",
    }}
  >
    {Object.entries(groupByFirstLetter(shortStatesData)).map(
      ([firstLetter, options]) => (
        <OptionGroup label={firstLetter} key={firstLetter}>
          {options.map((state) => (
            <Option value={state} key={state} />
          ))}
        </OptionGroup>
      )
    )}
  </ListBox>
);

export const DisabledOption: StoryFn<typeof ListBox> = (args) => (
  <ListBox
    {...args}
    style={{
      maxHeight: "calc((var(--salt-size-base) + var(--salt-spacing-100)) * 10)",
    }}
  >
    {shortStatesData.map((state) => (
      <Option disabled={state === "Arizona"} key={state} value={state} />
    ))}
  </ListBox>
);

export const Borderless = Template.bind({});
Borderless.args = {
  borderless: true,
};

export const Scrolling: StoryFn<typeof ListBox> = (args) => (
  <ListBox
    {...args}
    style={{
      maxHeight: "calc((var(--salt-size-base) + var(--salt-spacing-100)) * 10)",
    }}
  >
    {Object.entries(groupByFirstLetter(usStateExampleData)).map(
      ([firstLetter, options]) => (
        <OptionGroup label={firstLetter} key={firstLetter}>
          {options.map((state) => (
            <Option value={state} key={state} />
          ))}
        </OptionGroup>
      )
    )}
  </ListBox>
);

export const DefaultSelectedSingleSelect = Template.bind({});
DefaultSelectedSingleSelect.args = {
  defaultSelected: [usStateExampleData[3]],
};

export const DefaultSelectedMultiselect = Template.bind({});
DefaultSelectedMultiselect.args = {
  multiselect: true,
  defaultSelected: [usStateExampleData[3], usStateExampleData[4]],
};

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

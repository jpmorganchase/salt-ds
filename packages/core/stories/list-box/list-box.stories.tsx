import type { Meta, StoryFn } from "@storybook/react";
import { ListBox, Option, OptionGroup, StackLayout, Text } from "@salt-ds/core";
import { usStateExampleData, shortColorWithHex } from "../assets/exampleData";
import "./list-box.stories.css";
import { ReactElement } from "react";

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
  <ListBox {...args}>
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
  <ListBox {...args}>
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
  <ListBox {...args}>
    {shortStatesData.map((state) => (
      <Option disabled={state === "Arizona"} key={state} value={state} />
    ))}
  </ListBox>
);

export const Bordered = Template.bind({});
Bordered.args = {
  bordered: true,
};

export const Scrolling: StoryFn<typeof ListBox> = (args) => (
  <div style={{ maxHeight: 400 }}>
    <ListBox {...args}>
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
  </div>
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

export const ComplexOptions = (): ReactElement => {
  return (
    <ListBox>
      {shortColorWithHex.slice(0, 5).map(({ color, hex }) => (
        <Option value={color} key={color}>
          <StackLayout gap={0.5} align="start">
            <Text>
              <strong>{color}</strong>
            </Text>
            <Text styleAs="label" color="secondary">
              {hex}
            </Text>
          </StackLayout>
        </Option>
      ))}
    </ListBox>
  );
};

import { ComboBox, Option, OptionGroup } from "@salt-ds/lab";

import { Meta, StoryFn } from "@storybook/react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { countryMetaMap, GB, LazyCountrySymbol, US } from "@salt-ds/countries";
import { ChangeEvent, Suspense, SyntheticEvent, useState } from "react";

export default {
  title: "Lab/ComboBox",
  component: ComboBox,
  parameters: {
    docs: {
      source: {
        code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
      },
    },
  },
} as Meta<typeof ComboBox>;

const usStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
];

const Template: StoryFn<typeof ComboBox> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return (
    <ComboBox onChange={handleChange} value={value} {...args}>
      {usStates
        .filter((state) => state.toLowerCase().includes(value.toLowerCase()))
        .map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
    </ComboBox>
  );
};

export const Default = Template.bind({});

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: "Select a state",
};

export const WithDefaultSelected = Template.bind({});
WithDefaultSelected.args = {
  defaultSelected: ["California"],
  defaultValue: "California",
};

export const Readonly = Template.bind({});
Readonly.args = {
  readOnly: true,
  defaultSelected: ["California"],
  defaultValue: "California",
};

export const ReadonlyEmpty = Template.bind({});
ReadonlyEmpty.args = {
  readOnly: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  defaultSelected: ["California"],
  defaultValue: "California",
};

export const DisabledOption: StoryFn<typeof ComboBox> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  return (
    <ComboBox
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      {...args}
    >
      {usStates
        .filter((state) => state.toLowerCase().includes(value.toLowerCase()))
        .map((state) => (
          <Option value={state} key={state} disabled={state === "California"}>
            {state}
          </Option>
        ))}
    </ComboBox>
  );
};

export const Variants: StoryFn<typeof ComboBox> = () => {
  return (
    <StackLayout>
      <Template variant="primary" />
      <Template variant="secondary" />
    </StackLayout>
  );
};

export const MultiSelect = Template.bind({});
MultiSelect.args = {
  multiselect: true,
};

export const WithFormField: StoryFn = () => {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  return (
    <FormField>
      <FormFieldLabel>State</FormFieldLabel>
      <ComboBox
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        value={value}
      >
        {usStates
          .filter((state) => state.toLowerCase().includes(value.toLowerCase()))
          .map((state) => (
            <Option value={state} key={state}>
              {state}
            </Option>
          ))}
      </ComboBox>
      <FormFieldHelperText>Pick a US state</FormFieldHelperText>
    </FormField>
  );
};

export const Grouped: StoryFn<typeof ComboBox> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const options = [
    {
      value: "Chicago",
      country: "US",
    },
    {
      value: "Miami",
      country: "US",
    },
    {
      value: "New York",
      country: "US",
    },
    {
      value: "Liverpool",
      country: "GB",
    },
    {
      value: "London",
      country: "GB",
    },
    {
      value: "Manchester",
      country: "GB",
    },
  ];

  const groupedOptions = options
    .filter((city) => city.value.toLowerCase().includes(value.toLowerCase()))
    .reduce((acc, option) => {
      const country = option.country;
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(option);
      return acc;
    }, {} as Record<string, typeof options>);

  return (
    <ComboBox
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      {...args}
    >
      {Object.entries(groupedOptions).map(([country, options]) => (
        <OptionGroup label={country} key={country}>
          {options.map((option) => (
            <Option value={option.value} key={option.value}>
              {option.value}
            </Option>
          ))}
        </OptionGroup>
      ))}
    </ComboBox>
  );
};

export const ComplexOption: StoryFn<typeof ComboBox> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const options = [
    {
      value: "GB",
      icon: <GB />,
      textValue: "United Kingdom of Great Britain and Northern Ireland",
    },
    {
      value: "US",
      icon: <US />,
      textValue: "United States of America",
    },
  ];

  return (
    <ComboBox
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: 200 }}
      {...args}
    >
      {options
        .filter((country) =>
          country.textValue.toLowerCase().includes(value.toLowerCase())
        )
        .map((option) => (
          <Option
            value={option.value}
            key={option.value}
            textValue={option.textValue}
          >
            {option.icon} {option.textValue}
          </Option>
        ))}
    </ComboBox>
  );
};

export const LongList: StoryFn<typeof ComboBox> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const options = Object.values(countryMetaMap)
    .sort((a, b) => a.countryName.localeCompare(b.countryName))
    .filter(({ countryCode, countryName }) => {
      const searchText = value.toLowerCase();

      return (
        countryCode.toLowerCase().includes(searchText) ||
        countryName.toLowerCase().includes(searchText)
      );
    });

  const groupedOptions = options.reduce((acc, option) => {
    const groupName = option.countryName[0];
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(option);
    return acc;
  }, {} as Record<string, typeof options>);

  return (
    <ComboBox
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      {...args}
    >
      {Object.entries(groupedOptions).map(([firstLetter, options]) => (
        <OptionGroup label={firstLetter} key={firstLetter}>
          {options.map((country) => (
            <Option value={country.countryCode} key={country.countryCode}>
              <Suspense fallback="">
                <LazyCountrySymbol code={country.countryCode} />
              </Suspense>
              {country.countryName}
            </Option>
          ))}
        </OptionGroup>
      ))}
    </ComboBox>
  );
};

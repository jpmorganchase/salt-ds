import {
  ComboBoxNext,
  ComboBoxNextProps,
  Option,
  OptionGroup,
} from "@salt-ds/lab";

import { Meta, StoryFn } from "@storybook/react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { countryMetaMap, GB, LazyCountrySymbol, US } from "@salt-ds/countries";
import { ChangeEvent, Suspense, SyntheticEvent, useState } from "react";
import { usStateExampleData } from "../assets/exampleData";

export default {
  title: "Lab/Combo Box Next",
  component: ComboBoxNext,
  parameters: {
    docs: {
      source: {
        code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
      },
    },
  },
} as Meta<typeof ComboBoxNext>;

const usStates = usStateExampleData.slice(0, 10);

const Template: StoryFn<typeof ComboBoxNext> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    args.onSelectionChange?.(event, newSelected);

    if (args.multiselect) {
      setValue("");
      return;
    }

    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  return (
    <ComboBoxNext
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
    >
      {usStates
        .filter((state) =>
          state.toLowerCase().includes(value.trim().toLowerCase())
        )
        .map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))}
    </ComboBoxNext>
  );
};

export const Default = Template.bind({});

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: "State",
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

export const DisabledOption: StoryFn<typeof ComboBoxNext> = (args) => {
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
    <ComboBoxNext
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
    >
      {usStates
        .filter((state) =>
          state.toLowerCase().includes(value.trim().toLowerCase())
        )
        .map((state) => (
          <Option value={state} key={state} disabled={state === "California"}>
            {state}
          </Option>
        ))}
    </ComboBoxNext>
  );
};

export const Variants: StoryFn<typeof ComboBoxNext> = () => {
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
      <ComboBoxNext
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        value={value}
      >
        {usStates
          .filter((state) =>
            state.toLowerCase().includes(value.trim().toLowerCase())
          )
          .map((state) => (
            <Option value={state} key={state}>
              {state}
            </Option>
          ))}
      </ComboBoxNext>
      <FormFieldHelperText>Pick a US state</FormFieldHelperText>
    </FormField>
  );
};

export const Grouped: StoryFn<typeof ComboBoxNext> = (args) => {
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
    .filter((city) =>
      city.value.trim().toLowerCase().includes(value.trim().toLowerCase())
    )
    .reduce((acc, option) => {
      const country = option.country;
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(option);
      return acc;
    }, {} as Record<string, typeof options>);

  return (
    <ComboBoxNext
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
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
    </ComboBoxNext>
  );
};

export const ComplexOption: StoryFn<typeof ComboBoxNext> = (args) => {
  const options = [
    {
      value: "GB",
      icon: <GB aria-hidden />,
      textValue: "United Kingdom of Great Britain and Northern Ireland",
    },
    {
      value: "US",
      icon: <US aria-hidden />,
      textValue: "United States of America",
    },
  ];

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
      setValue(
        options.find((option) => option.value === newSelected[0])?.textValue ??
          ""
      );
    } else {
      setValue("");
    }
  };

  return (
    <ComboBoxNext
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: 200 }}
    >
      {options
        .filter((country) =>
          country.textValue.toLowerCase().includes(value.trim().toLowerCase())
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
    </ComboBoxNext>
  );
};

export const LongList: StoryFn<typeof ComboBoxNext> = (args) => {
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
      setValue(
        Object.values(countryMetaMap).find(
          (country) => country.countryCode === newSelected[0]
        )?.countryName ?? ""
      );
    } else {
      setValue("");
    }
  };

  const options = Object.values(countryMetaMap)
    .sort((a, b) => a.countryName.localeCompare(b.countryName))
    .filter(({ countryCode, countryName }) => {
      const searchText = value.trim().toLowerCase();

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
    <ComboBoxNext
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
    >
      {Object.entries(groupedOptions).map(([firstLetter, options]) => (
        <OptionGroup label={firstLetter} key={firstLetter}>
          {options.map((country) => (
            <Option value={country.countryCode} key={country.countryCode}>
              <Suspense fallback="">
                <LazyCountrySymbol aria-hidden code={country.countryCode} />
              </Suspense>
              {country.countryName}
            </Option>
          ))}
        </OptionGroup>
      ))}
    </ComboBoxNext>
  );
};

export const EmptyMessage: StoryFn<typeof ComboBoxNext> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (args.multiselect) {
      return;
    }

    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const filteredOptions = usStates.filter((state) =>
    state.toLowerCase().includes(value.trim().toLowerCase())
  );

  return (
    <ComboBoxNext
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
    >
      {filteredOptions.length > 0 ? (
        filteredOptions.map((state) => (
          <Option value={state} key={state}>
            {state}
          </Option>
        ))
      ) : (
        <Option value="">No results found for &quot;{value}&quot;</Option>
      )}
    </ComboBoxNext>
  );
};

export const Validation = () => {
  return (
    <StackLayout>
      <Template validationStatus="error" />
      <Template validationStatus="warning" />
      <Template validationStatus="success" />
    </StackLayout>
  );
};

export const CustomFiltering: StoryFn<typeof ComboBoxNext> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");
  const [showAll, setShowAll] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    setShowAll(false);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    args.onSelectionChange?.(event, newSelected);

    if (args.multiselect) {
      setValue("");
      return;
    }

    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const handleOpenChange: ComboBoxNextProps["onOpenChange"] = (event) => {
    if (event.type === "click") {
      setShowAll(true);
    }
  };

  const filteredOptions = usStates.filter((state) =>
    state.toLowerCase().includes(value.trim().toLowerCase())
  );

  const options = showAll ? usStates : filteredOptions;

  return (
    <ComboBoxNext
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      onOpenChange={handleOpenChange}
      value={value}
    >
      {options.map((state) => (
        <Option value={state} key={state}>
          {state}
        </Option>
      ))}
    </ComboBoxNext>
  );
};

interface Person {
  id: number;
  firstName: string;
  lastName: string;
}

const people: Person[] = [
  { id: 1, firstName: "John", lastName: "Doe" },
  { id: 2, firstName: "Jane", lastName: "Doe" },
  { id: 3, firstName: "John", lastName: "Smith" },
  { id: 4, firstName: "Jane", lastName: "Smith" },
];

export const ObjectValue: StoryFn<typeof ComboBoxNext> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");
  const [selected, setSelected] = useState<Person[]>([]);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: Person[]
  ) => {
    setSelected(newSelected);

    setValue("");
  };

  const options = people.filter(
    (person) =>
      person.firstName.toLowerCase().includes(value.trim().toLowerCase()) ||
      person.lastName.toLowerCase().includes(value.trim().toLowerCase())
  );

  console.log(selected, value);

  return (
    <ComboBoxNext
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      selected={selected}
      multiselect
    >
      {options.map((person) => (
        <Option value={person} key={person.id}>
          {person.firstName} {person.lastName}
        </Option>
      ))}
    </ComboBoxNext>
  );
};

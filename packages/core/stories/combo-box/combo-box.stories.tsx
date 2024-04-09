import { Meta, StoryFn } from "@storybook/react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
  ComboBox,
  ComboBoxProps,
  Option,
  OptionGroup,
} from "@salt-ds/core";
import {
  CountryCode,
  countryMetaMap,
  GB,
  LazyCountrySymbol,
  US,
} from "@salt-ds/countries";
import { ChangeEvent, Suspense, SyntheticEvent, useState } from "react";
import { usStateExampleData } from "../assets/exampleData";

export default {
  title: "Core/Combo Box",
  component: ComboBox,
  parameters: {
    docs: {
      source: {
        code: "Disabled for this story, see https://github.com/storybookjs/storybook/issues/11554",
      },
    },
  },
} as Meta<typeof ComboBox>;

const usStates = usStateExampleData.slice(0, 10);

function getTemplateDefaultValue({
  defaultValue,
  defaultSelected,
  multiselect,
}: Pick<
  ComboBoxProps,
  "defaultValue" | "defaultSelected" | "multiselect"
>): string {
  if (multiselect) {
    return "";
  }

  if (defaultValue) {
    return String(defaultValue);
  }

  return defaultSelected?.[0] ?? "";
}

const Template: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(getTemplateDefaultValue(args));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

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
    <ComboBox
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: 150 }}
    >
      {usStates
        .filter((state) =>
          state.toLowerCase().includes(value.trim().toLowerCase())
        )
        .map((state) => (
          <Option value={state} key={state} />
        ))}
    </ComboBox>
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
};

export const Readonly = Template.bind({});
Readonly.args = {
  readOnly: true,
  defaultSelected: ["California"],
};

export const ReadonlyEmpty = Template.bind({});
ReadonlyEmpty.args = {
  readOnly: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  defaultSelected: ["California"],
};

export const DisabledOption: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  return (
    <ComboBox
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
          <Option value={state} key={state} disabled={state === "California"} />
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
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

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
          .filter((state) =>
            state.toLowerCase().includes(value.trim().toLowerCase())
          )
          .map((state) => (
            <Option value={state} key={state} />
          ))}
      </ComboBox>
      <FormFieldHelperText>Pick a US state</FormFieldHelperText>
    </FormField>
  );
};

export const Grouped: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

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
    <ComboBox
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
    >
      {Object.entries(groupedOptions).map(([country, options]) => (
        <OptionGroup label={country} key={country}>
          {options.map((option) => (
            <Option value={option.value} key={option.value} />
          ))}
        </OptionGroup>
      ))}
    </ComboBox>
  );
};

type Country = {
  value: string;
  icon: JSX.Element;
  textValue: string;
};

const options: Country[] = [
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

export const ComplexOption: StoryFn<ComboBoxProps<Country>> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: Country[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

    if (newSelected.length === 1) {
      setValue(newSelected[0].textValue);
    } else {
      setValue("");
    }
  };

  return (
    <ComboBox<Country>
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: 200 }}
      valueToString={(country) => country.textValue}
    >
      {options
        .filter((country) =>
          country.textValue.toLowerCase().includes(value.trim().toLowerCase())
        )
        .map((option) => (
          <Option value={option} key={option.value}>
            {option.icon} {option.textValue}
          </Option>
        ))}
    </ComboBox>
  );
};

export const LongList: StoryFn<ComboBoxProps<CountryCode>> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: CountryCode[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

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
    <ComboBox<CountryCode>
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      valueToString={(countryCode) => countryMetaMap[countryCode].countryName}
    >
      <Suspense fallback="">
        {Object.entries(groupedOptions).map(([firstLetter, options]) => (
          <OptionGroup label={firstLetter} key={firstLetter}>
            {options.map((country) => (
              <Option value={country.countryCode} key={country.countryCode}>
                <LazyCountrySymbol aria-hidden code={country.countryCode} />
                {country.countryName}
              </Option>
            ))}
          </OptionGroup>
        ))}
      </Suspense>
    </ComboBox>
  );
};

export const EmptyMessage: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

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
    <ComboBox
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
    >
      {filteredOptions.length > 0 ? (
        filteredOptions.map((state) => <Option value={state} key={state} />)
      ) : (
        <Option value="">No results found for &quot;{value}&quot;</Option>
      )}
    </ComboBox>
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

export const CustomFiltering: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");
  const [showAll, setShowAll] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
    setShowAll(false);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

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

  const handleOpenChange: ComboBoxProps["onOpenChange"] = (
    _newOpen,
    reason
  ) => {
    if (reason === "manual") {
      setShowAll(true);
    }
  };

  const filteredOptions = usStates.filter((state) =>
    state.toLowerCase().includes(value.trim().toLowerCase())
  );

  const options = showAll ? usStates : filteredOptions;

  return (
    <ComboBox
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      onOpenChange={handleOpenChange}
      value={value}
    >
      {options.map((state) => (
        <Option value={state} key={state} />
      ))}
    </ComboBox>
  );
};

interface Person {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
}

const people: Person[] = [
  { id: 1, firstName: "John", lastName: "Doe", displayName: "John Doe" },
  { id: 2, firstName: "Jane", lastName: "Doe", displayName: "Jane Doe" },
  { id: 3, firstName: "John", lastName: "Smith", displayName: "John Smith" },
  { id: 4, firstName: "Jane", lastName: "Smith", displayName: "Jane Smith" },
];

export const ObjectValue: StoryFn<ComboBoxProps<Person>> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");
  const [selected, setSelected] = useState<Person[]>([]);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: Person[]
  ) => {
    // React 16 backwards compatibility
    event.persist();

    setSelected(newSelected);

    setValue("");
  };

  const options = people.filter(
    (person) =>
      person.firstName.toLowerCase().includes(value.trim().toLowerCase()) ||
      person.lastName.toLowerCase().includes(value.trim().toLowerCase())
  );

  return (
    <ComboBox<Person>
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      selected={selected}
      multiselect
      valueToString={(person) => person.displayName}
    >
      {options.map((person) => (
        <Option value={person} key={person.id} />
      ))}
    </ComboBox>
  );
};

export const MultiplePills = Template.bind({});
MultiplePills.args = {
  defaultSelected: ["Alabama", "Alaska", "Arizona"],
  multiselect: true,
};

export const MultiplePillsTruncated = Template.bind({});
MultiplePillsTruncated.args = {
  defaultSelected: ["Alabama", "Alaska", "Arizona"],
  multiselect: true,
  truncate: true,
};

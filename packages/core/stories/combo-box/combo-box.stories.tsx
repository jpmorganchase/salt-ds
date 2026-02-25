import {
  Button,
  ComboBox,
  type ComboBoxProps,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Option,
  OptionGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { type CountryCode, countryMetaMap } from "@salt-ds/countries";
import { CloseIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import "@salt-ds/countries/saltCountries.css";
import {
  type ChangeEvent,
  type CSSProperties,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { usStateExampleData } from "../assets/exampleData";

export default {
  title: "Core/Combo Box",
  component: ComboBox,
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
    newSelected: string[],
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
      style={{ width: 152 }}
    >
      {usStates
        .filter((state) =>
          state.toLowerCase().includes(value.trim().toLowerCase()),
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
    newSelected: string[],
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
          state.toLowerCase().includes(value.trim().toLowerCase()),
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
      <Template variant="tertiary" />
    </StackLayout>
  );
};

export const Multiselect = Template.bind({});
Multiselect.args = {
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
    newSelected: string[],
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
            state.toLowerCase().includes(value.trim().toLowerCase()),
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
    newSelected: string[],
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
      city.value.trim().toLowerCase().includes(value.trim().toLowerCase()),
    )
    .reduce(
      (acc, option) => {
        const country = option.country;
        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(option);
        return acc;
      },
      {} as Record<string, typeof options>,
    );

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

type Contact = {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  id: string;
};

const contacts: Contact[] = [
  {
    firstName: "Kamron",
    lastName: "Marisa",
    displayName: "Kamron Marisa",
    email: "Kamron_Marisa20@example.net",
    id: "26c1ff5f-78a9-4b2b-bbaf-cb5285ed4d79",
  },
  {
    firstName: "Matilda",
    lastName: "Cathrine",
    displayName: "Matilda Cathrine",
    email: "Matilda_Cathrine32@example.com",
    id: "45b8b157-2ab1-479f-9289-fe4a12e899c7",
  },
  {
    firstName: "Neva",
    lastName: "Reuben",
    displayName: "Neva Reuben",
    email: "Neva.Reuben45@example.net",
    id: "bbe8230e-0559-4fc0-8575-10329b56b3c5",
  },
  {
    firstName: "Laney",
    lastName: "Hilton",
    displayName: "Laney Hilton",
    email: "Laney.Hilton65@example.com",
    id: "f6b9885e-16e8-4fd5-a658-4207e168cdbb",
  },
  {
    firstName: "Madison",
    lastName: "Rosa",
    displayName: "Madison Rosa",
    email: "Madison.Rosa34@example.org",
    id: "405fe991-84e6-4d45-85a6-feb0c010106b",
  },
  {
    firstName: "Consuelo",
    lastName: "Elijah",
    displayName: "Consuelo Elijah",
    email: "Consuelo.Elijah87@example.org",
    id: "688fdb00-9f31-4a33-90cd-e82b71b51f4c",
  },
  {
    firstName: "Taurean",
    lastName: "Blaise",
    displayName: "Taurean Blaise",
    email: "Taurean_Blaise@example.net",
    id: "335662e3-0802-4f39-aaeb-78720aa75ca2",
  },
  {
    firstName: "Therese",
    lastName: "Irma",
    displayName: "Therese Irma",
    email: "Therese.Irma20@example.com",
    id: "c64c65d7-c193-48b1-b586-6ae4586d9d85",
  },
  {
    firstName: "Terry",
    lastName: "Alaina",
    displayName: "Terry Alaina",
    email: "Terry_Alaina@example.com",
    id: "f2f30596-f35e-4ef4-96ce-1d168a9c2db7",
  },
  {
    firstName: "Mike",
    lastName: "Shanny",
    displayName: "Mike Shanny",
    email: "Mike_Shanny5@example.org",
    id: "66162734-165a-4fb6-8701-b59497b799aa",
  },
  {
    firstName: "Adolf",
    lastName: "Gerda",
    displayName: "Adolf Gerda",
    email: "Adolf.Gerda77@example.org",
    id: "93d62117-07a6-4615-95ed-4591af3205eb",
  },
  {
    firstName: "Magali",
    lastName: "Donna",
    displayName: "Magali Donna",
    email: "Magali_Donna@example.net",
    id: "96b5c1a5-443b-44d3-bc39-f8ed746aa7b3",
  },
  {
    firstName: "Rhiannon",
    lastName: "Emerald",
    displayName: "Rhiannon Emerald",
    email: "Rhiannon.Emerald36@example.com",
    id: "53c6ac6a-56f3-4740-874f-57dceba46451",
  },
  {
    firstName: "William",
    lastName: "Rowan",
    displayName: "William Rowan",
    email: "William.Rowan93@example.org",
    id: "27def2df-eb35-4229-8492-e80171abbe3a",
  },
  {
    firstName: "Santiago",
    lastName: "Maida",
    displayName: "Santiago Maida",
    email: "Santiago.Maida@example.net",
    id: "455be580-8f45-4ff3-9437-78dd60c03279",
  },
  {
    firstName: "Marilyne",
    lastName: "Candice",
    displayName: "Marilyne Candice",
    email: "Marilyne.Candice@example.net",
    id: "539c291c-3c4a-4b47-b38d-1e946aa18a4e",
  },
  {
    firstName: "Norbert",
    lastName: "Nikita",
    displayName: "Norbert Nikita",
    email: "Norbert.Nikita@example.org",
    id: "b01bf4fb-33ca-4ebf-befc-1ba27b06833a",
  },
  {
    firstName: "Maximo",
    lastName: "Carmel",
    displayName: "Maximo Carmel",
    email: "Maximo.Carmel@example.org",
    id: "cf2de37d-9e72-4a8e-bfb4-db78e5a0b239",
  },
  {
    firstName: "Edward",
    lastName: "Kyler",
    displayName: "Edward Kyler",
    email: "Edward.Kyler74@example.net",
    id: "50ec7911-f90a-4f3b-b49d-33bbb7a012dd",
  },
  {
    firstName: "Judson",
    lastName: "Carey",
    displayName: "Judson Carey",
    email: "Judson_Carey15@example.com",
    id: "4c6513a6-c08a-40a7-a54c-414b4d29db9f",
  },
];

export const ComplexOption: StoryFn<ComboBoxProps<Contact>> = (args) => {
  const [value, setValue] = useState(args.defaultValue?.toString() ?? "");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: Contact[],
  ) => {
    // React 16 backwards compatibility
    event.persist();

    if (newSelected.length === 1) {
      setValue(newSelected[0].displayName);
    } else {
      setValue("");
    }
  };

  return (
    <ComboBox<Contact>
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: 200 }}
      valueToString={(contact) => contact.displayName}
    >
      {contacts
        .filter((contact) =>
          contact.displayName
            .toLowerCase()
            .includes(value.trim().toLowerCase()),
        )
        .map((contact) => (
          <Option value={contact} key={contact.id}>
            <StackLayout gap={0.5} align="start">
              <Text>{contact.displayName}</Text>
              <Text styleAs="label" color="secondary">
                {contact.email}
              </Text>
            </StackLayout>
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
    newSelected: CountryCode[],
  ) => {
    // React 16 backwards compatibility
    event.persist();

    if (newSelected.length === 1) {
      setValue(
        Object.values(countryMetaMap).find(
          (country) => country.countryCode === newSelected[0],
        )?.countryName ?? "",
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

  const groupedOptions = options.reduce(
    (acc, option) => {
      const groupName = option.countryName[0];
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(option);
      return acc;
    },
    {} as Record<string, typeof options>,
  );

  return (
    <ComboBox<CountryCode>
      {...args}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      valueToString={(countryCode) => countryMetaMap[countryCode].countryName}
    >
      {Object.entries(groupedOptions).map(([firstLetter, options]) => (
        <OptionGroup label={firstLetter} key={firstLetter}>
          {options.map((country) => (
            <Option value={country.countryCode} key={country.countryCode}>
              <div className={`saltCountry-${country.countryCode}`} />
              {country.countryName}
            </Option>
          ))}
        </OptionGroup>
      ))}
    </ComboBox>
  );
};

export const EmptyMessage: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(
    args.defaultValue?.toString() ?? "Yelloww",
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[],
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
    state.toLowerCase().includes(value.trim().toLowerCase()),
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
    newSelected: string[],
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
    reason,
  ) => {
    if (reason === "manual") {
      setShowAll(true);
    }
  };

  const filteredOptions = usStates.filter((state) =>
    state.toLowerCase().includes(value.trim().toLowerCase()),
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
    newSelected: Person[],
  ) => {
    // React 16 backwards compatibility
    event.persist();

    setSelected(newSelected);

    setValue("");
  };

  const options = people.filter(
    (person) =>
      person.firstName.toLowerCase().includes(value.trim().toLowerCase()) ||
      person.lastName.toLowerCase().includes(value.trim().toLowerCase()),
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

export const FreeText: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(getTemplateDefaultValue(args));
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[],
  ) => {
    // React 16 backwards compatibility
    event.persist();

    args.onSelectionChange?.(event, newSelected);
    setSelectedValues(newSelected);

    setValue("");
  };

  return (
    <ComboBox
      {...args}
      multiselect
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: 150 }}
    >
      {Array.from(new Set(usStates.concat(selectedValues)))
        .filter((state) =>
          state.toLowerCase().includes(value.trim().toLowerCase()),
        )
        .map((state) => (
          <Option value={state} key={state} />
        ))}
      {value && !usStates.includes(value) && (
        <Option value={value} key={value}>
          Add &quot;{value}&quot;
        </Option>
      )}
    </ComboBox>
  );
};

export const SelectOnTab = Template.bind({});
SelectOnTab.args = {
  multiselect: true,
  selectOnTab: true,
};

export const ClearSelection: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(getTemplateDefaultValue(args));
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[],
  ) => {
    setSelected(newSelected);
    args.onSelectionChange?.(event, newSelected);
    setValue("");
  };

  const filteredOptions = usStates.filter((state) =>
    state.toLowerCase().includes(value.trim().toLowerCase()),
  );

  const handleClear = () => {
    setValue("");
    setSelected([]);
  };

  return (
    <ComboBox
      {...args}
      multiselect
      endAdornment={
        (value || selected.length > 0) && (
          <Button
            onClick={handleClear}
            aria-label="Clear value"
            appearance="transparent"
          >
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      selected={selected}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
    >
      {filteredOptions.map((state) => (
        <Option value={state} key={state} />
      ))}
    </ComboBox>
  );
};

export const Bordered = () => {
  return (
    <StackLayout>
      <Template bordered />
      <Template bordered variant="secondary" />
      <Template bordered variant="tertiary" />
      <Template bordered validationStatus="error" />
      <Template bordered validationStatus="warning" />
      <Template bordered validationStatus="success" />
    </StackLayout>
  );
};

const hugeArray = Array.from({ length: 10000 }).map(
  (_, index) => `Option ${index}`,
);

export const PerformanceTest: StoryFn<ComboBoxProps> = (args) => {
  const [value, setValue] = useState(getTemplateDefaultValue(args));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // React 16 backwards compatibility
    event.persist();

    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[],
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

  const filteredItems = hugeArray.filter((item) =>
    item.toLowerCase().includes(value.trim().toLowerCase()),
  );

  return (
    <ComboBox
      value={value}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
    >
      {filteredItems.map((item) => (
        <Option key={item} value={item}>
          {item}
        </Option>
      ))}
    </ComboBox>
  );
};

const virtualizedItems = ["a", "b", "c", "d", "e", "f", "g"];

const RenderOption = ({
  index,
  style,
  data,
}: {
  index: number;
  style: CSSProperties;
  data: string[];
}) => (
  <Option key={data[index]} value={data[index]} style={style}>
    {data[index]}
  </Option>
);

export const Virtualized: StoryFn<ComboBoxProps> = () => {
  // Importing dynamically to avoid issues if react-window is not installed
  const [FixedSizeList, setFixedSizeList] = useState<
    typeof import("react-window").FixedSizeList | null
  >(null);

  useEffect(() => {
    import("react-window").then((mod) => {
      setFixedSizeList(() => mod.FixedSizeList);
    });
  }, []);

  if (!FixedSizeList) {
    return <div>Loading...</div>;
  }

  return (
    <ComboBox<string>>
      <FixedSizeList<string[]>
        height={3 * 36}
        width="100%"
        itemCount={virtualizedItems.length}
        itemSize={36}
        itemData={virtualizedItems}
      >
        {RenderOption}
      </FixedSizeList>
    </ComboBox>
  );
};

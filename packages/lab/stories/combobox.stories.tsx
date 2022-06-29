import { Button, FormField } from "@jpmorganchase/uitk-core";
import { CloseIcon } from "@jpmorganchase/uitk-icons";
import {
  ComboBox,
  escapeRegExp,
  GetFilterRegex,
  ListChangeHandler,
  ListItemBase,
  ListItemProps,
  ListSelectHandler,
  useListItem,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { ChangeEvent, ComponentProps, memo, useRef, useState } from "react";
import { IndexedListItemProps } from "../src/list";
import { Highlighter } from "../src/list/internal/Highlighter";

export default {
  title: "Lab/ComboBox",
  component: ComboBox,
} as ComponentMeta<typeof ComboBox>;

const shortColorData = [
  "Baby blue",
  "Black",
  "Blue",
  "Brown",
  "Green",
  "Orange",
  "Pink",
  "Purple",
  "Red",
  "White",
  "Yellow",
];

const statesData = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

type LargeCity = {
  name: string;
  countryCode: string;
};

const largestCities: LargeCity[] = [
  { name: "Tokyo", countryCode: "JP" },
  { name: "Delhi", countryCode: "IN" },
  { name: "Shanghai", countryCode: "CN" },
  { name: "São Paulo", countryCode: "BR" },
  { name: "Mexico City", countryCode: "MX" },
  { name: "Cairo", countryCode: "EG" },
  { name: "Mumbai", countryCode: "IN" },
  { name: "Beijing", countryCode: "CN" },
  { name: "Dhaka", countryCode: "BD" },
  { name: "Osaka", countryCode: "JP" },
  { name: "New York City", countryCode: "US" },
  { name: "Karachi", countryCode: "PK" },
  { name: "Buenos Aires", countryCode: "AR" },
  { name: "Chongqing", countryCode: "CN" },
  { name: "Istanbul", countryCode: "TR" },
  { name: "Kolkata", countryCode: "IN" },
  { name: "Manila", countryCode: "PH" },
  { name: "Lagos", countryCode: "NG" },
  { name: "Rio de Janeiro", countryCode: "BR" },
  { name: "Tianjin", countryCode: "CN" },
];

// TODO revisit with Flag?
const MemoizedCityItem = memo(function MemoizedItem({
  item: { name, countryCode },
  itemTextHighlightPattern,
  ...restProps
}: ListItemProps<LargeCity> & { item: LargeCity }) {
  return (
    <ListItemBase {...restProps}>
      <img
        src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
        width={20}
        alt={`${countryCode} flag`}
      />
      <span style={{ marginLeft: 10 }}>
        <Highlighter matchPattern={itemTextHighlightPattern} text={name} />
      </span>
    </ListItemBase>
  );
});

const CityListItem = (props: IndexedListItemProps<LargeCity>) => {
  const { item, itemProps } = useListItem(props);
  return <MemoizedCityItem item={item} {...itemProps} />;
};

const cityItemToString = ({ name }: LargeCity) => name;

const ComboBoxTemplate: ComponentStory<typeof ComboBox> = (args) => {
  return <ComboBox {...args} />;
};

const FormFieldComboBoxTemplate: Story<
  ComponentProps<typeof ComboBox> &
    Pick<
      ComponentProps<typeof FormField>,
      "labelPlacement" | "label" | "required" | "LabelProps"
    >
> = (args) => {
  const {
    source,
    width,
    labelPlacement,
    label,
    required,
    LabelProps,
    ...rest
  } = args;
  return (
    <FormField
      label={label}
      labelPlacement={labelPlacement}
      required={required}
      style={{ width }}
      LabelProps={LabelProps}
    >
      <ComboBox source={source} width={width} {...rest} />
    </FormField>
  );
};

const ControlledComboBoxTemplate: ComponentStory<typeof ComboBox> = (args) => {
  const {
    source = statesData,
    width = 292,
    onInputChange,
    onSelect,
    ...rest
  } = args;

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value.trim().toUpperCase());
    onInputChange?.(event, value);
  };

  const handleSelect: ListSelectHandler<string> = (event, item) => {
    setInputValue(item ? item.toUpperCase() : "");
    onSelect?.(event, item);
  };

  return (
    <FormField label="Select" style={{ maxWidth: 292 }}>
      <ComboBox
        source={source}
        width={width}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSelect={handleSelect}
        {...rest}
      />
    </FormField>
  );
};

export const Default = ComboBoxTemplate.bind({});
Default.args = {
  source: statesData,
  width: 292,
};

export const MultiSelect = ComboBoxTemplate.bind({});
MultiSelect.args = {
  ...Default.args,
  multiSelect: true,
};

export const MultiSelectWithInitialSelection = ComboBoxTemplate.bind({});
MultiSelectWithInitialSelection.args = {
  ...MultiSelect.args,
  initialSelectedItem: [
    statesData[1],
    statesData[3],
    statesData[6],
    statesData[10],
    statesData[15],
  ],
};

export const MultiSelectWithFreeTextItem = ComboBoxTemplate.bind({});
MultiSelectWithFreeTextItem.args = {
  ...MultiSelect.args,
  allowFreeText: true,
};

export const Disabled = ComboBoxTemplate.bind({});
Disabled.args = {
  ...Default.args,
  disabled: true,
};

export const WithCustomizedFilter = ComboBoxTemplate.bind({});
const getFilterRegex: GetFilterRegex = (value) =>
  new RegExp(`\\b(${escapeRegExp(value)})`, "gi");
WithCustomizedFilter.args = {
  ...Default.args,
  getFilterRegex,
};

export const ItemRenderer: ComponentStory<typeof ComboBox> = (args) => {
  return (
    <FormField label="Select a large city" style={{ maxWidth: 292 }}>
      <ComboBox {...args} />
    </FormField>
  );
};

ItemRenderer.args = {
  ListItem: CityListItem,
  displayedItemCount: 5,
  itemToString: cityItemToString,
  source: largestCities,
};

export const Controlled = ControlledComboBoxTemplate.bind({});

export const ControlledSelection: ComponentStory<typeof ComboBox> = ({
  onChange,
}) => {
  const [selectedItem, setSelectedItem] = useState<string>(shortColorData[1]);
  const [multiSelectedItems, setMultiSelectedItems] = useState<string[]>([
    shortColorData[1],
  ]);

  const handleChange: ListChangeHandler<string, "default"> = (
    event,
    newSelectedItem
  ) => {
    setSelectedItem(newSelectedItem as string);
    onChange?.(event, newSelectedItem as any);
  };

  const handleMultiChange: ListChangeHandler<string, "multiple"> = (
    event,
    newSelectedItem
  ) => {
    setMultiSelectedItems(newSelectedItem as string[]);
    onChange?.(event, newSelectedItem as string[]);
  };

  const shuffleSelection = () => {
    setSelectedItem(
      shortColorData[Math.floor(Math.random() * shortColorData.length)]
    );
    setMultiSelectedItems([
      shortColorData[Math.floor(Math.random() * shortColorData.length)],
    ]);
  };

  return (
    <div>
      <Button onClick={shuffleSelection}>Shuffle Selection</Button>
      <FormField label="Single Select" style={{ maxWidth: 292 }}>
        <ComboBox
          source={shortColorData}
          selectedItem={selectedItem}
          onChange={handleChange}
        />
      </FormField>
      <FormField label="Multi Select" style={{ maxWidth: 292 }}>
        <ComboBox
          multiSelect
          source={shortColorData}
          selectedItem={multiSelectedItems}
          onChange={handleMultiChange}
        />
      </FormField>
    </div>
  );
};

export const WithFormField = FormFieldComboBoxTemplate.bind({});
WithFormField.args = {
  label: "Select",
  width: 292,
  source: shortColorData,
  labelPlacement: "top",
};
export const WithFormFieldLabelLeft = FormFieldComboBoxTemplate.bind({});
WithFormFieldLabelLeft.args = {
  ...WithFormField.args,
  labelPlacement: "left",
};
export const WithFreeText = FormFieldComboBoxTemplate.bind({});
WithFreeText.args = {
  ...WithFormField.args,
  label: "Enter a value",
  allowFreeText: true,
};
export const WithInitialSelection = FormFieldComboBoxTemplate.bind({});
WithInitialSelection.args = {
  ...WithFormField.args,
  initialSelectedItem: shortColorData[3],
};

export const WithCustomizedWidth = FormFieldComboBoxTemplate.bind({});
WithCustomizedWidth.args = {
  ...WithFormField.args,
  listWidth: 400,
};

export const WithInitialOpen = FormFieldComboBoxTemplate.bind({});
WithInitialOpen.args = {
  ...WithFormField.args,
  initialOpen: true,
};

export const Scrolling: ComponentStory<typeof ComboBox> = (args) => {
  const key = useRef(1);
  const containerEl = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(200);

  const setPosition = (pos: string) => {
    if (containerEl.current != null) {
      key.current += 1;
      const { height } = containerEl.current.getBoundingClientRect();
      switch (pos) {
        case "top":
          setOffsetTop(window.scrollY + 50);
          break;
        case "bottom":
          setOffsetTop(window.innerHeight - 80 + window.scrollY);
          break;
        default:
          setOffsetTop(window.innerHeight / 2 + window.scrollY - height / 2);
      }
    }
  };

  return (
    <div style={{ height: 2000 }}>
      <div
        style={{
          position: "fixed",
          left: 10,
          width: 200,
          height: 120,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {["top", "middle", "bottom"].map((pos) => (
          <Button onClick={() => setPosition(pos)}>
            Position near the {pos}
          </Button>
        ))}
      </div>
      <div ref={containerEl} style={{ position: "absolute", top: offsetTop }}>
        <FormField label="Select" style={{ maxWidth: 292 }}>
          <ComboBox key={key.current} {...args} />
        </FormField>
      </div>
    </div>
  );
};

Scrolling.args = {
  source: statesData,
};

export const MultiSelectDisabled = ComboBoxTemplate.bind({});
MultiSelectDisabled.args = {
  ...MultiSelect.args,
  disabled: true,
};

export const MultiSelectWithFormField = FormFieldComboBoxTemplate.bind({});
MultiSelectWithFormField.args = {
  ...WithFormField.args,
  ...MultiSelect.args,
};

export const MultiSelectWithFormFieldLabelLeft = FormFieldComboBoxTemplate.bind(
  {}
);
MultiSelectWithFormFieldLabelLeft.args = {
  ...WithFormFieldLabelLeft.args,
  ...MultiSelect.args,
};

export const MultiSelectWithFormFieldWithInitialSelection =
  FormFieldComboBoxTemplate.bind({});
MultiSelectWithFormFieldWithInitialSelection.args = {
  ...MultiSelectWithFormField.args,
  ...MultiSelectWithInitialSelection.args,
};

export const MultiSelectControlled = FormFieldComboBoxTemplate.bind({});
MultiSelectControlled.args = {
  ...Controlled.args,
  multiSelect: true,
};

export const Autocomplete: ComponentStory<typeof ComboBox> = (args) => {
  const { onInputChange, onSelect, source: inputSource, ...restArgs } = args;
  const [inputValue, setInputValue] = useState("");
  const [showList, setShowList] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredData = showList
    ? inputSource.filter((x: string) =>
        x.match(new RegExp(escapeRegExp(inputValue), "ig"))
      )
    : [];

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
    setShowList(true);
    onInputChange?.(event, value);
  };

  const clearInput = () => {
    setInputValue("");
    // Re-focus the input after clearing input
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // This makes sure no list will be shown next time when focused
    setShowList(false);
  };

  const handleSelect: ListSelectHandler<string> = (event, item) => {
    setInputValue(item ?? "");
    onSelect?.(event, item);
  };

  return (
    <FormField label="Autocomplete" style={{ maxWidth: 292 }}>
      <ComboBox
        {...restArgs}
        allowFreeText
        InputProps={{
          endAdornment: inputValue ? (
            <Button onClick={clearInput} variant="secondary">
              <CloseIcon aria-label="clear input" size="small" />
            </Button>
          ) : null,
          onBlur: handleBlur,
          onChange: handleInputChange,
        }}
        inputRef={inputRef}
        inputValue={inputValue}
        onSelect={handleSelect}
        source={filteredData}
      />
    </FormField>
  );
};

Autocomplete.args = { source: shortColorData };

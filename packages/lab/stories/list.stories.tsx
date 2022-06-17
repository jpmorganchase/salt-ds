import { Button, FormField, useDensity } from "@jpmorganchase/uitk-core";
import { ChevronDownIcon, ChevronUpIcon } from "@jpmorganchase/uitk-icons";
import {
  Input,
  List,
  ListChangeHandler,
  ListItem,
  ListItemBase,
  ListItemBaseProps,
  ListProps,
  ListScrollHandles,
  useListItem,
  useListItemContext,
} from "@jpmorganchase/uitk-lab";
import { IndexedListItemProps } from "@jpmorganchase/uitk-lab/src/list";
import type {
  ComponentMeta,
  ComponentStory,
  DecoratorFn,
  Story,
} from "@storybook/react";
import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  FC,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usStateExampleData as listExampleData } from "./exampleData";

import "./list.stories.css";

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  width: "100vw",
};

const withFullViewWidth: DecoratorFn = (Story) => (
  <div style={containerStyle}>
    <Story />
  </div>
);

export default {
  title: "Lab/List",
  component: List,
  decorators: [withFullViewWidth],
} as ComponentMeta<typeof List>;

const Template: Story<ListProps> = ({ onChange, ...restProps }) => {
  const handleChange: ListChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    onChange?.(event, selectedItem);
  };

  return <List onChange={handleChange} {...restProps} />;
};

export const FeatureList: Story<ListProps> = Template.bind({});

FeatureList.args = {
  disabled: false,
  virtualized: false,
  maxWidth: 292,
  minWidth: "8em",
  selectionVariant: "default",
  source: listExampleData,
};

FeatureList.argTypes = {
  selectionVariant: {
    options: ["default", "deselectable", "multiple"],
    control: {
      type: "inline-radio",
    },
  },
};

export const DefaultList: Story<ListProps> = (props) => (
  <List maxWidth={292} source={listExampleData} {...props} />
);

export const BorderlessList: Story<ListProps> = (props) => (
  <List maxWidth={292} source={listExampleData} borderless={true} {...props} />
);

export const DeclarativeList: Story<ListProps> = (props) => (
  <List displayedItemCount={5} width={292} {...props}>
    <ListItem>Alabama</ListItem>
    <ListItem>Alaska</ListItem>
    <ListItem disabled>Arizona</ListItem>
    <ListItem>Arkansas</ListItem>
    <ListItem>California</ListItem>
    <ListItem>Colorado</ListItem>
    <ListItem disabled>Connecticut</ListItem>
    <ListItem>Delaware</ListItem>
    <ListItem>Florida</ListItem>
    <ListItem>Georgia</ListItem>
  </List>
);

export const VirtualizedList: Story<ListProps> = (props) => (
  <List maxWidth={292} source={listExampleData} virtualized={true} {...props} />
);

export const DeselectableList: Story<ListProps> = (props) => (
  <List
    maxWidth={292}
    selectionVariant="deselectable"
    source={listExampleData}
    {...props}
  />
);

export const DisplayedItemCount: Story<ListProps> = (props) => (
  <List
    displayedItemCount={4}
    width={292}
    source={listExampleData}
    {...props}
  />
);

export const ControlledList: Story = () => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, []);

  useEffect(() => {
    if (selectedItem) {
      console.log("selection changed", selectedItem);
    }
  }, [selectedItem]);

  const handleArrowDown = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.min(listExampleData.length - 1, prevHighlightedIndex + 1)
    );
  };

  const handleArrowUp = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1)
    );
  };

  const handleSelect = () => {
    setSelectedItem(listExampleData[highlightedIndex]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxWidth: 292,
      }}
    >
      <div
        ref={buttonsRef}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button
          disabled={highlightedIndex === listExampleData.length - 1}
          onClick={handleArrowDown}
        >
          <ChevronDownIcon size={12} />
        </Button>
        <Button disabled={highlightedIndex <= 0} onClick={handleArrowUp}>
          <ChevronUpIcon size={12} />
        </Button>
        <Button onClick={handleSelect}>Select</Button>
      </div>
      <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <List<string | null>
          disableFocus
          highlightedIndex={highlightedIndex}
          selectedItem={selectedItem}
          source={listExampleData}
        />
      </div>
    </div>
  );
};

type Item = {
  label: string;
  disabled?: boolean;
};

const source = listExampleData.map(
  (label, index): Item => ({
    label,
    ...(index % 4 === 3 && { disabled: true }),
  })
);

const itemToString: ListProps<Item>["itemToString"] = ({ label }) => label;

export const DisabledList: Story = () => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [disabled, setDisabled] = useState(false);
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleChange: ListChangeHandler<Item> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  const handleToggleDisabled = () => {
    setDisabled((prevDisabled) => !prevDisabled);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxWidth: 292,
      }}
    >
      <div
        ref={buttonsRef}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button onClick={handleToggleDisabled}>
          {disabled ? "Enable" : "Disable"} list
        </Button>
      </div>
      <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <List<Item>
          disabled={disabled}
          itemToString={itemToString}
          maxWidth={292}
          onChange={handleChange}
          source={source}
        />
      </div>
    </div>
  );
};

const Group: FC<ComponentPropsWithoutRef<"div">> = (props) => {
  return <div className="uitkListGroup" {...props} />;
};

const GroupHeader: FC<ComponentPropsWithoutRef<"div">> = (props) => {
  const { getItemHeight } = useListItemContext<string>();
  const height = getItemHeight?.();

  return <div className="uitkListGroupHeader" style={{ height }} {...props} />;
};

export const Grouped: Story = () => (
  <div style={containerStyle}>
    <List maxWidth={292}>
      <Group>
        <GroupHeader>A</GroupHeader>
        <ListItem>Alabama</ListItem>
        <ListItem>Alaska</ListItem>
        <ListItem>Arizona</ListItem>
        <ListItem>Arkansas</ListItem>
      </Group>
      <Group>
        <GroupHeader>C</GroupHeader>
        <ListItem>California</ListItem>
        <ListItem>Colorado</ListItem>
        <ListItem>Connecticut</ListItem>
      </Group>
      <Group>
        <GroupHeader>I</GroupHeader>
        <ListItem>Idaho</ListItem>
        <ListItem>Illinois</ListItem>
        <ListItem>Indiana</ListItem>
        <ListItem>Iowa</ListItem>
      </Group>
      <Group>
        <GroupHeader>K</GroupHeader>
        <ListItem>Kansas</ListItem>
        <ListItem>Kentucky</ListItem>
      </Group>
      <Group>
        <GroupHeader>M</GroupHeader>
        <ListItem>Maine</ListItem>
        <ListItem>Maryland</ListItem>
        <ListItem>Massachusetts</ListItem>
        <ListItem>Michigan</ListItem>
        <ListItem>Minnesota</ListItem>
        <ListItem>Mississippi</ListItem>
        <ListItem>Missouri</ListItem>
        <ListItem>Montana</ListItem>
      </Group>
      <Group>
        <GroupHeader>N</GroupHeader>
        <ListItem>Nebraska</ListItem>
        <ListItem>Nevada</ListItem>
        <ListItem>New Hampshire</ListItem>
        <ListItem>New Jersey</ListItem>
        <ListItem>New Mexico</ListItem>
        <ListItem>New York</ListItem>
      </Group>
    </List>
  </div>
);

// For some reason, props of List will be overridden to `undefined`
// if we're not doing props destructuring. This only happens locally.
export const MultiSelectionList: ComponentStory<typeof List> = ({
  width,
  selectionVariant,
  source,
  ...restProps
}) => (
  <List
    width={width ?? 292}
    selectionVariant={selectionVariant ?? "multiple"}
    source={source ?? listExampleData}
    {...restProps}
  />
);

// We don't want to introduce true run time randomness otherwise
// our visual regression test wouldn't work. Cheating a bit to
// sort string without 1st character
const randomizedData = listExampleData
  .slice()
  .sort((a, b) => a.substring(1).localeCompare(b.substring(1)));

// We need an example of list not following alphabetical order to test certain feature, e.g. type to select
export const RandomOrderList: ComponentStory<typeof List> = (props) => (
  <List width={292} source={randomizedData} {...props} />
);

export const TabToSelect: ComponentStory<typeof List> = ({
  selectionVariant: _,
  tabToSelect,
  ...restProps
}) => (
  <>
    <div>
      <h4>default</h4>
      <List
        width={240}
        selectionVariant={"default"}
        source={listExampleData}
        tabToSelect={tabToSelect ?? true}
        {...restProps}
      />
    </div>
    <div>
      <h4>deselectable</h4>
      <List
        width={240}
        selectionVariant={"deselectable"}
        source={listExampleData}
        tabToSelect={tabToSelect ?? true}
        {...restProps}
      />
    </div>
    <div>
      <h4>multiple</h4>
      <List
        width={240}
        selectionVariant={"multiple"}
        source={listExampleData}
        tabToSelect={tabToSelect ?? true}
        {...restProps}
      />
    </div>
  </>
);

// Default the args to true, still enable change to false during run time
TabToSelect.args = {
  tabToSelect: true,
};

const NUMBER_REGEX = /^(|[1-9][0-9]*)$/;

export const ScrollToIndex: Story<ListProps> = ({ source, ...restProps }) => {
  const inputFieldRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListScrollHandles<string>>(null);

  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (inputFieldRef.current) {
      setOffsetHeight(inputFieldRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value;

    if (NUMBER_REGEX.exec(inputValue) && listRef.current) {
      listRef.current.scrollToIndex(parseInt(inputValue, 10) || 0);
    }
  };

  const listSource = source ?? listExampleData;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: 292,
      }}
    >
      <FormField label="Type an index to scroll to" ref={inputFieldRef}>
        <Input
          inputProps={{
            min: 0,
            max: listSource.length - 1,
          }}
          onChange={handleInputChange}
          type="number"
        />
      </FormField>
      <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <List ref={listRef} source={listSource} {...restProps} />
      </div>
    </div>
  );
};

const heightByDensity = {
  high: 24,
  medium: 32,
  low: 36,
  touch: 36,
};

export const VariableHeightList: Story<ListProps> = ({
  onChange,
  ...restProps
}) => {
  const density = useDensity();

  const getItemHeight = (index = 0) => {
    const height = heightByDensity[density];
    return height * ((index % 3) + 1);
  };

  const handleChange: ListChangeHandler<string> = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    onChange?.(event, selectedItem);
  };

  return (
    <List
      displayedItemCount={6}
      getItemHeight={getItemHeight}
      width={292}
      onChange={handleChange}
      source={listExampleData}
      {...restProps}
    />
  );
};

export const VariableHeightVirtualizedList: Story<ListProps> = ({
  onChange,
  ...restProps
}) => {
  const density = useDensity();

  const getItemHeight = (index = 0) => {
    const height = heightByDensity[density];
    return height * ((index % 3) + 1);
  };

  const handleChange: ListChangeHandler<string> = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    onChange?.(event, selectedItem);
  };

  return (
    <List
      displayedItemCount={6}
      getItemHeight={getItemHeight}
      width={292}
      onChange={handleChange}
      source={listExampleData}
      virtualized={true}
      {...restProps}
    />
  );
};

interface State {
  name: string;
  abbrev: string;
}

const stateItemToString = (item?: State) => {
  // console.log(`stateItemToString`, item);
  return item ? `${item.name} - ${item.abbrev}` : "";
};

/**
 * We intentionally created this example with some "heavy" components.
 * We memoize it with its props to avoid unnecessary re-render.
 */
const MemoizedItem = memo<{ label: string } & ListItemBaseProps>(
  function MemoizedItem({ label, ...restProps }) {
    return (
      <ListItemBase {...restProps}>
        <label>{label}</label>
      </ListItemBase>
    );
  }
);

const CustomListItem: FC<IndexedListItemProps<State>> = (props) => {
  const {
    item,
    itemProps: { style: itemStyle, ...restItemProps },
  } = useListItem<State>(props);

  const style = useMemo(
    () => ({
      ...itemStyle,
      fontStyle: "italic",
    }),
    [itemStyle]
  );

  return (
    <MemoizedItem
      label={stateItemToString(item)}
      style={style}
      {...restItemProps}
    />
  );
};

const abbrevStateExampleData = [
  { name: "Alabama", abbrev: "AL" },
  { name: "Alaska", abbrev: "AK" },
  { name: "Arizona", abbrev: "AZ" },
  { name: "Arkansas", abbrev: "AR" },
  { name: "California", abbrev: "CA" },
  { name: "Colorado", abbrev: "CO" },
  { name: "Connecticut", abbrev: "CT" },
  { name: "Delaware", abbrev: "DE" },
  { name: "Florida", abbrev: "FL" },
  { name: "Georgia", abbrev: "GA" },
  { name: "Hawaii", abbrev: "HI" },
  { name: "Idaho", abbrev: "ID" },
  { name: "Illinois", abbrev: "IL" },
  { name: "Indiana", abbrev: "IN" },
  { name: "Iowa", abbrev: "IA" },
  { name: "Kansas", abbrev: "KS" },
  { name: "Kentucky", abbrev: "KY" },
  { name: "Louisiana", abbrev: "LA" },
  { name: "Maine", abbrev: "ME" },
  { name: "Maryland", abbrev: "MD" },
  { name: "Massachusetts", abbrev: "MA" },
  { name: "Michigan", abbrev: "MI" },
  { name: "Minnesota", abbrev: "MN" },
  { name: "Mississippi", abbrev: "MS" },
  { name: "Missouri", abbrev: "MO" },
  { name: "Montana", abbrev: "MT" },
  { name: "Nebraska", abbrev: "NE" },
  { name: "Nevada", abbrev: "NV" },
  { name: "New Hampshire", abbrev: "NH" },
  { name: "New Jersey", abbrev: "NJ" },
  { name: "New Mexico", abbrev: "NM" },
  { name: "New York", abbrev: "NY" },
  { name: "North Carolina", abbrev: "NC" },
  { name: "North Dakota", abbrev: "ND" },
  { name: "Ohio", abbrev: "OH" },
  { name: "Oklahoma", abbrev: "OK" },
  { name: "Oregon", abbrev: "OR" },
  { name: "Pennsylvania", abbrev: "PA" },
  { name: "Rhode Island", abbrev: "RI" },
  { name: "South Carolina", abbrev: "SC" },
  { name: "South Dakota", abbrev: "SD" },
  { name: "Tennessee", abbrev: "TN" },
  { name: "Texas", abbrev: "TX" },
  { name: "Utah", abbrev: "UT" },
  { name: "Vermont", abbrev: "VT" },
  { name: "Virginia", abbrev: "VA" },
  { name: "Washington", abbrev: "WA" },
  { name: "West Virginia", abbrev: "WV" },
  { name: "Wisconsin", abbrev: "WI" },
  { name: "Wyoming", abbrev: "WY" },
];

export const WithItemRenderer: Story<ListProps<State>> = ({
  onChange,
  ...restProps
}) => {
  const handleStateChange: ListChangeHandler<State> = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    // Doing JSON.stringify so Storybook Actions tab will show something instead of undefined.
    // @ts-ignore
    onChange?.(event, JSON.stringify(selectedItem));
  };

  return (
    <List
      ListItem={CustomListItem}
      itemToString={stateItemToString}
      maxWidth={292}
      onChange={handleStateChange}
      {...restProps}
    />
  );
};

WithItemRenderer.args = {
  source: abbrevStateExampleData,
};

// const ListPlaceholder = () => (
//   <ContentStatus message="Did you hide it somewhere?" title="No source found" />
// );
const ListPlaceholder = () => (
  <span>TODO: Replace this string in a span with a ContentStatus</span>
);

export const WithPlaceholder: Story<ListProps> = ({
  onChange,
  ...restProps
}) => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [displaySource, setDisplaySource] = useState(true);
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleChange: ListChangeHandler<string> = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    onChange?.(event, selectedItem);
  };

  const handleToggleDisplaySource = () => {
    setDisplaySource((prevDisplay) => !prevDisplay);
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          maxWidth: 292,
        }}
      >
        <div
          ref={buttonsRef}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button onClick={handleToggleDisplaySource}>
            {displaySource ? "Hide" : "Display"} source
          </Button>
        </div>
        <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
          <List
            ListPlaceholder={ListPlaceholder}
            onChange={handleChange}
            source={displaySource ? listExampleData : undefined}
            {...restProps}
          />
        </div>
      </div>
    </div>
  );
};

export const WithTextTruncation: Story<ListProps<State>> = ({
  onChange,
  ...restProps
}) => {
  const handleStateChange: ListChangeHandler<State> = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    onChange?.(event, selectedItem);
  };

  return (
    <List maxWidth={100} onChange={handleStateChange} {...restProps}>
      <ListItem>69 Manchester Road, London, EC90 6QG</ListItem>
      <ListItem>1 London Road, London, N98 3LH</ListItem>
      <ListItem>2 Church Lane, London, EC36 8IO</ListItem>
      <ListItem>59 Kings Road, London, SW95 1ZO</ListItem>
      <ListItem>33 New Road, London, EC82 0HX</ListItem>
      <ListItem>19 Church Lane, London, EC53 1OW</ListItem>
      <ListItem>64 Main Street, London, EC72 4CR</ListItem>
      <ListItem>83 South Street, London, EC67 8NP</ListItem>
    </List>
  );
};

export const WithLastFocusRestored: Story<ListProps> = ({
  onChange,
  ...props
}) => {
  const handleChange: ListChangeHandler = (event, selectedItem) => {
    console.log("selection changed", selectedItem);
    onChange?.(event, selectedItem);
  };

  return (
    <List
      initialSelectedItem={listExampleData[4]}
      width={292}
      onChange={handleChange}
      restoreLastFocus={true}
      source={listExampleData}
      {...props}
    />
  );
};

WithLastFocusRestored.args = {
  restoreLastFocus: true,
};

export const WithTextHighlight: Story<ListProps> = (props) => {
  const inputFieldRef = useRef<HTMLDivElement>(null);

  const [highlightRegex, setHighlightIndex] = useState<RegExp>();
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (inputFieldRef.current) {
      setOffsetHeight(inputFieldRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value;
    setHighlightIndex(
      inputValue ? new RegExp(`(${inputValue})`, "gi") : undefined
    );
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          maxWidth: 292,
        }}
      >
        <FormField label="Type to highlight" ref={inputFieldRef}>
          <Input onChange={handleInputChange} />
        </FormField>
        <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
          <List
            disableFocus
            itemTextHighlightPattern={highlightRegex}
            source={listExampleData}
            {...props}
          />
        </div>
      </div>
    </div>
  );
};

const itemCount = listExampleData.length;
const getItemIndex = (item: string) => listExampleData.indexOf(item);
const getItemAtIndex = (index: number) => listExampleData[index];

export const WithoutSource: Story<ListProps> = (props) => (
  <List
    getItemAtIndex={getItemAtIndex}
    getItemIndex={getItemIndex}
    itemCount={itemCount}
    width={292}
    {...props}
  />
);

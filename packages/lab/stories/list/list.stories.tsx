import {
  Button,
  FlexItem,
  FlexLayout,
  StackLayout,
  StatusIndicator,
  Text,
  useDensity,
} from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";
import {
  FormField,
  Input,
  List,
  ListItem,
  ListItemGroup,
  type ListItemProps,
  type ListItemType,
  type ListProps,
  type ListScrollHandles,
  type SelectHandler,
  type SelectionChangeHandler,
  VirtualizedList,
} from "@salt-ds/lab";
import type { Decorator, Meta, StoryFn } from "@storybook/react-vite";
import {
  type ChangeEventHandler,
  type CSSProperties,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usa_states } from "./list.data";

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  width: "calc(100vw - 2em)",
};

const withFullViewWidth: Decorator = (Story) => (
  <div style={containerStyle}>
    <Story />
  </div>
);

type CustomItem = {
  label: string;
  disabled?: boolean;
};

const customItemToString: ListProps<CustomItem>["itemToString"] = ({ label }) =>
  label;

export default {
  title: "Lab/List",
  component: List,
  decorators: [withFullViewWidth],
} as Meta<typeof List>;

export const Default: StoryFn<ListProps> = (props) => {
  return (
    <List
      {...props}
      aria-label="Listbox example"
      maxWidth={292}
      source={usa_states}
    />
  );
};

export const Borderless: StoryFn<ListProps> = (props) => (
  <List
    aria-label="Borderless List example"
    maxWidth={292}
    source={usa_states}
    borderless={true}
    {...props}
  />
);

export const Declarative: StoryFn<ListProps> = (props) => {
  return (
    <List
      {...props}
      aria-label="Declarative List example"
      displayedItemCount={5}
      width={292}
    >
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
};

export const VirtualizedListExample: StoryFn<ListProps> = (props) => {
  return (
    <VirtualizedList
      aria-label="Listbox example"
      maxWidth={292}
      source={usa_states}
      {...props}
    />
  );
};

export const Deselectable: StoryFn<ListProps> = (props) => {
  return (
    <List
      aria-label="Deselectable List example"
      maxWidth={292}
      selectionStrategy="deselectable"
      source={usa_states}
      {...props}
    />
  );
};

export const DisplayedItemCount: StoryFn<ListProps> = (props) => {
  return (
    <List
      aria-label="DisplayedItemCount List example"
      displayedItemCount={4}
      maxWidth={292}
      source={usa_states}
      {...props}
    />
  );
};

export const Controlled: StoryFn<ListProps> = (props) => {
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
      Math.min(usa_states.length - 1, prevHighlightedIndex + 1),
    );
  };

  const handleArrowUp = () => {
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1),
    );
  };

  const handleSelect = () => {
    setSelectedItem(usa_states[highlightedIndex] || null);
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
        style={{ display: "flex", justifyContent: "flex-end", zIndex: 1 }}
      >
        <Button
          disabled={highlightedIndex === usa_states.length - 1}
          onClick={handleArrowDown}
        >
          <ArrowDownIcon />
        </Button>
        <Button disabled={highlightedIndex <= 0} onClick={handleArrowUp}>
          <ArrowUpIcon />
        </Button>
        <Button onClick={handleSelect}>Select</Button>
      </div>
      <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <List
          aria-label="Controlled List example"
          disableFocus
          highlightedIndex={highlightedIndex}
          selected={selectedItem}
          source={usa_states}
          {...props}
        />
      </div>
    </div>
  );
};

export const Disabled: StoryFn<ListProps<CustomItem>> = (props) => {
  const source = useMemo(
    () =>
      usa_states.map(
        (label, index): CustomItem => ({
          label,
          ...(index % 4 === 3 && { disabled: true }),
        }),
      ),
    [],
  );

  const buttonsRef = useRef<HTMLDivElement>(null);
  const [disabled, setDisabled] = useState(false);
  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleChange: SelectionChangeHandler<CustomItem> = (
    _,
    selectedItem,
  ) => {
    console.log("selection changed", selectedItem);
  };
  const handleSelect: SelectHandler<CustomItem> = (_, selectedItem) => {
    console.log("selected", selectedItem);
  };

  const handleToggleDisabled = () => {
    setDisabled((prevDisabled) => !prevDisabled);
  };

  return (
    <FlexLayout direction="column" gap={0}>
      <FlexItem
        ref={buttonsRef}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button onClick={handleToggleDisabled}>
          {disabled ? "Enable" : "Disable"} list
        </Button>
      </FlexItem>
      <FlexItem style={{ height: `calc(100% - ${offsetHeight}px)` }}>
        <List<CustomItem>
          disabled={disabled}
          itemToString={customItemToString}
          onSelect={handleSelect}
          onSelectionChange={handleChange}
          source={source}
          width={292}
          {...props}
        />
      </FlexItem>
    </FlexLayout>
  );
};

export const Grouped: StoryFn<ListProps> = (props) => (
  <>
    <style>{`#grouped-list .saltListItemHeader {
      background: var(--salt-color-gray-20);
      }`}</style>
    <List
      aria-label="Grouped List example"
      maxWidth={292}
      stickyHeaders
      {...props}
    >
      <ListItemGroup title="A">
        <ListItem>Alabama</ListItem>
        <ListItem>Alaska</ListItem>
        <ListItem>Arizona</ListItem>
        <ListItem>Arkansas</ListItem>
      </ListItemGroup>
      <ListItemGroup title="C">
        <ListItem>California</ListItem>
        <ListItem>Colorado</ListItem>
        <ListItem>Connecticut</ListItem>
      </ListItemGroup>
      <ListItemGroup title="I">
        <ListItem>Idaho</ListItem>
        <ListItem>Illinois</ListItem>
        <ListItem>Indiana</ListItem>
        <ListItem>Iowa</ListItem>
      </ListItemGroup>
      <ListItemGroup title="K">
        <ListItem>Kansas</ListItem>
        <ListItem>Kentucky</ListItem>
      </ListItemGroup>
      <ListItemGroup title="M">
        <ListItem>Maine</ListItem>
        <ListItem>Maryland</ListItem>
        <ListItem>Massachusetts</ListItem>
        <ListItem>Michigan</ListItem>
        <ListItem>Minnesota</ListItem>
        <ListItem>Mississippi</ListItem>
        <ListItem>Missouri</ListItem>
        <ListItem>Montana</ListItem>
      </ListItemGroup>
      <ListItemGroup title="N">
        <ListItem>Nebraska</ListItem>
        <ListItem>Nevada</ListItem>
        <ListItem>New Hampshire</ListItem>
        <ListItem>New Jersey</ListItem>
        <ListItem>New Mexico</ListItem>
        <ListItem>New York</ListItem>
      </ListItemGroup>
    </List>
  </>
);

export const MultiSelection: StoryFn<ListProps> = (props) => {
  return (
    <FlexLayout>
      <FlexItem>
        <List
          aria-label="MultiSelection Listbox example"
          checkable={false}
          width={292}
          selectionStrategy="multiple"
          source={usa_states}
          {...props}
        />
      </FlexItem>
      <FlexItem>
        <List
          aria-label="MultiSelection Listbox example"
          width={292}
          selectionStrategy="multiple"
          source={usa_states}
          {...props}
        />
      </FlexItem>
    </FlexLayout>
  );
};

// We don't want to introduce true run time randomness otherwise
// our visual regression test wouldn't work. Cheating a bit to
// sort string without 1st character
const randomizedData = usa_states
  .slice()
  .sort((a, b) => a.substring(1).localeCompare(b.substring(1)));

// We need an example of list not following alphabetical order to test certain feature, e.g. type to select
export const RandomOrder: StoryFn<ListProps> = (props) => (
  <List width={292} source={randomizedData} {...props} />
);

export const TabToSelect: StoryFn<ListProps> = () => {
  return (
    <FlexLayout>
      <FlexItem>
        <h4>default</h4>
        <List
          aria-label="List example"
          width={240}
          source={usa_states}
          tabToSelect
        />
      </FlexItem>
      <FlexItem>
        <h4>deselectable</h4>
        <List
          aria-label="Deselectable List example"
          width={240}
          selectionStrategy="deselectable"
          source={usa_states}
          tabToSelect
        />
      </FlexItem>
      <FlexItem>
        <h4>multiple</h4>
        <List
          aria-label="MultiSelectable List example"
          width={240}
          selectionStrategy="multiple"
          source={usa_states}
          tabToSelect
        />
      </FlexItem>
    </FlexLayout>
  );
};

export const ScrollToIndex: StoryFn<ListProps> = () => {
  const inputFieldRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<ListScrollHandles<string>>(null);
  const virtualizedListScrollRef = useRef<ListScrollHandles<string>>(null);
  const NUMBER_REGEX = /^(|[1-9][0-9]*)$/;

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value;

    if (NUMBER_REGEX.test(inputValue)) {
      listScrollRef.current?.scrollToIndex(
        Number.parseInt(inputValue, 10) || 0,
      );
      virtualizedListScrollRef.current?.scrollToIndex(
        Number.parseInt(inputValue, 10) || 0,
      );
    }
  };

  return (
    <StackLayout style={{ width: 292 * 2 }}>
      <FormField label="Type an index to scroll to" ref={inputFieldRef}>
        <Input
          inputProps={{
            min: 0,
            max: usa_states.length - 1,
          }}
          onChange={handleInputChange}
          type="number"
        />
      </FormField>
      <FlexLayout>
        <List
          aria-label="ScrollToIndex List example"
          scrollingApiRef={listScrollRef}
          source={usa_states}
        />

        <VirtualizedList
          aria-label="ScrollToIndex VirtualizedList example"
          scrollingApiRef={virtualizedListScrollRef}
          source={usa_states}
        />
      </FlexLayout>
    </StackLayout>
  );
};

export const VariableHeight: StoryFn<ListProps> = () => {
  const heightByDensity = useMemo(
    () => ({
      high: 24,
      medium: 32,
      low: 36,
      touch: 36,
    }),
    [],
  );

  const density = useDensity();

  const getItemHeight = (index: number) => {
    const height = heightByDensity[density];
    return height * ((index % 3) + 1);
  };

  return (
    <List
      aria-label="VariableHeight List example"
      displayedItemCount={6}
      getItemHeight={getItemHeight}
      maxWidth={292}
      source={usa_states}
    />
  );
};

interface State {
  name: string;
  abbrev: string;
}

/**
 * We intentionally created this example with some "heavy" components.
 * We memoize it with its props to avoid unnecessary re-render.
 */
const MemoizedItem = memo<{ label?: string } & ListItemProps<State>>(
  function MemoizedItem({ label, ...restProps }) {
    return (
      <ListItem {...restProps}>
        <span>{label}</span>
      </ListItem>
    );
  },
);

const CustomListItem: ListItemType<State> = ({
  style: styleProp,
  ...props
}) => {
  const style = useMemo(
    () =>
      ({
        ...styleProp,
        fontStyle: "italic",
      }) as CSSProperties,
    [styleProp],
  );
  return <MemoizedItem style={style} {...props} />;
};

export const WithItemRenderer: StoryFn<ListProps<State>> = (props) => {
  const listExampleData = useMemo(
    () =>
      [
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
      ] as ReadonlyArray<State>,
    [],
  );

  const stateItemToString = (item?: State) =>
    item ? `${item.name} - ${item.abbrev}` : "";

  return (
    <List<State>
      ListItem={CustomListItem}
      aria-label="Custom ItemRenderer example"
      itemToString={stateItemToString}
      maxWidth={292}
      source={listExampleData}
      {...props}
    />
  );
};

const ListPlaceholder = () => (
  <StackLayout gap={1} align="center">
    <StatusIndicator status="info" size={2} />
    <Text>
      <strong>No source found</strong>
    </Text>
    <Text>Did you hide it somewhere?</Text>
  </StackLayout>
);

export const WithPlaceholder: StoryFn<ListProps> = (props) => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [displaySource, setDisplaySource] = useState(true);

  const handleChange: SelectionChangeHandler<string> = (_, selectedItem) => {
    console.log("selection changed", selectedItem);
  };

  const handleToggleDisplaySource = () => {
    setDisplaySource((prevDisplay) => !prevDisplay);
  };

  return (
    <FlexLayout
      direction="column"
      gap={0}
      style={{
        height: 600,
        width: 292,
      }}
    >
      <FlexItem
        shrink={0}
        grow={0}
        ref={buttonsRef}
        style={{ height: 30, justifyContent: "flex-end" }}
      >
        <Button onClick={handleToggleDisplaySource}>
          {displaySource ? "Hide" : "Display"} source
        </Button>
      </FlexItem>
      <FlexItem grow={1}>
        <List
          ListPlaceholder={ListPlaceholder}
          aria-label="Placeholder List example"
          onSelectionChange={handleChange}
          source={displaySource ? usa_states : undefined}
          {...props}
        />
      </FlexItem>
    </FlexLayout>
  );
};

export const WithTextTruncation: StoryFn<ListProps> = () => {
  return (
    <List aria-label="Truncated List example" maxWidth={100}>
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

export const WithLastFocusRestored: StoryFn<ListProps> = () => {
  return (
    <List
      aria-label="RestoreLastFocus List example"
      defaultSelected={usa_states[4]}
      maxWidth={292}
      restoreLastFocus
      source={usa_states}
    />
  );
};

export const WithTextHighlight: StoryFn<ListProps> = () => {
  const inputFieldRef = useRef<HTMLDivElement>(null);

  const [highlightRegex, setHighlightIndex] = useState<RegExp>();

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value;
    setHighlightIndex(
      inputValue ? new RegExp(`(${inputValue})`, "gi") : undefined,
    );
  };

  return (
    <FlexLayout
      direction="column"
      gap={0}
      style={{
        height: 600,
        width: 292,
      }}
    >
      <FlexItem>
        <FormField label="Type to highlight" ref={inputFieldRef}>
          <Input defaultValue="" onChange={handleInputChange} />
        </FormField>
        <List
          disableFocus
          itemTextHighlightPattern={highlightRegex}
          source={usa_states}
        />
      </FlexItem>
    </FlexLayout>
  );
};

export const DisableTypeToSelect: StoryFn<ListProps> = () => {
  const handleChange: SelectionChangeHandler = (evt, selected) => {
    console.log("selectionChanged", selected);
  };

  return (
    <List
      aria-label="Listbox example"
      disableTypeToSelect
      maxWidth={292}
      onSelectionChange={handleChange}
      source={usa_states}
    />
  );
};

export const ExtendedSelection: StoryFn<ListProps> = () => {
  const handleSelectionChange: SelectionChangeHandler = (evt, selected) => {
    console.log({ selected });
  };
  return (
    <List
      width={292}
      onSelectionChange={handleSelectionChange}
      selectionStrategy="extended"
      source={usa_states}
    />
  );
};

export const WithTextHighlightDeclarative: StoryFn<ListProps> = () => {
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
      inputValue ? new RegExp(`(${inputValue})`, "gi") : undefined,
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
          <Input defaultValue="" onChange={handleInputChange} />
        </FormField>
        <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
          <List disableFocus itemTextHighlightPattern={highlightRegex}>
            <ListItem>
              <span>Alabama</span>
            </ListItem>
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
        </div>
      </div>
    </div>
  );
};

export const Empty: StoryFn<ListProps> = (props) => {
  const buttonsRef = useRef<HTMLDivElement>(null);
  const NO_DATA = useMemo<string[]>(() => [], []);
  const [data, setData] = useState<string[]>(NO_DATA);

  const resetData = () => {
    if (data === NO_DATA) {
      setData(usa_states);
    } else {
      setData(NO_DATA);
    }
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
      <div>
        When List has no data, focusVisible is applied to the List itself. When
        data is present, ListItems receive focusVisible.
      </div>
      <div
        ref={buttonsRef}
        style={{ display: "flex", justifyContent: "flex-end", zIndex: 1 }}
      >
        <Button onClick={resetData}>
          {data === NO_DATA ? "Load Data" : "Clear Data"}
        </Button>
      </div>
      <div>
        <List
          aria-label="Controlled List example"
          height={400}
          source={data}
          {...props}
        />
      </div>
    </div>
  );
};

// export const SimpleListDefaultHighlight = () => {
//   return (
//     <div
//       style={{
//         ...fullWidthHeight,
//       }}
//     >
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List defaultHighlightedIdx={3} source={usa_states} />
//       </div>
//     </div>
//   );
// };

// export const SimpleListDefaultSelection = () => {
//   return (
//     <div
//       style={{
//         ...fullWidthHeight,
//       }}
//     >
//       <input type="text" />
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List defaultSelected={["California"]} source={usa_states} />
//       </div>
//       <input type="text" />
//     </div>
//   );
// };

// export const SimpleListWithHeaders = () => {
//   const wrapperStyle = {
//     width: 150,
//     height: 400,
//     maxHeight: 400,
//     position: "relative",
//     border: "solid 1px #ccc",
//   };
//   return (
//     <div
//       style={{
//         ...fullWidthHeight,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <input type="text" />
//       <div style={wrapperStyle}>
//         <List source={groupByInitialLetter(usa_states, "headers-only")} />
//       </div>
//       <div style={wrapperStyle}>
//         <List
//           collapsibleHeaders
//           source={groupByInitialLetter(usa_states, "headers-only")}
//         />
//       </div>
//       <div style={wrapperStyle}>
//         <List
//           collapsibleHeaders
//           selection="none"
//           source={groupByInitialLetter(usa_states, "headers-only")}
//         />
//       </div>
//       <input type="text" />
//     </div>
//   );
// };

// export const SimpleListWithGroups = () => {
//   return (
//     <div
//       style={{
//         width: 900,
//         height: 900,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//           <List
//             collapsibleHeaders
//             source={groupByInitialLetter(usa_states, "groups-only")}
//             style={{ maxHeight: 500 }}
//           />
//       </div>
//     </div>
//   );
// };

// export const SimpleListWithNestedGroups = () => {
//   return (
//     <div
//       style={{
//         width: 900,
//         height: 900,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <input type="text" />
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//           <List
//             collapsibleHeaders
//             source={groupByInitialLetter(usa_states_cities, "groups-only")}
//             style={{ maxHeight: 500 }}
//           />
//       </div>
//       <input type="text" />
//     </div>
//   );
// };

// export const MultiSelectList = () => {
//   return (
//     <div
//       style={{
//         width: 900,
//         height: 900,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <div
//         style={{
//           width: 200,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List selection="multi" source={usa_states} />
//       </div>
//       <div
//         style={{
//           width: 200,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <VirtualizedList selection="multi" source={usa_states} />
//       </div>
//     </div>
//   );
// };

// export const CheckboxSelectList = () => {
//   return (
//     <div
//       style={{
//         width: 900,
//         height: 900,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <input type="text" />
//       <div
//         style={{
//           width: 250,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List selection="checkbox" source={usa_states} />
//       </div>
//       <div
//         style={{
//           width: 250,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <VirtualizedList selection="checkbox" source={usa_states} />
//       </div>
//       <input type="text" />
//     </div>
//   );
// };

// export const CheckboxOnlySelectList = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <input type="text" />
//       <div
//         style={{
//           width: 300,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List
//           onChange={(value) => setSelectedValue(value)}
//           selection="checkbox-only"
//           source={usa_states}
//         />
//       </div>
//       <input type="text" />
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const ExtendedSelectList = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <div
//       style={{
//         ...fullWidthHeight,
//         display: "flex",
//         gap: 50,
//         alignItems: "flex-start",
//       }}
//     >
//       <input type="text" />
//       <div
//         style={{
//           width: 300,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List
//           onChange={(value) => setSelectedValue(value)}
//           selection="extended"
//           source={usa_states}
//         />
//       </div>
//       <input type="text" />
//       <div>{usa_states[selectedValue]}</div>
//     </div>
//   );
// };

// export const ControlledList = () => {
//   const [selected, setSelected] = useState([]);
//   const [hilitedIdx, setHilitedIdx] = useState(-1);

//   const handleChangeController = (evt, newSelected) => {
//     console.log(`handleChangeController`);
//     setSelected(newSelected);
//   };
//   const handleChangeControlled = (idx) => {
//     console.log(`handleChangeControlled`);
//     console.log(`controlled clicked ${idx}`);
//   };

//   return (
//     <div style={{ display: "flex", height: 600 }}>
//       <div>
//         <input type="text" />
//         <List
//           id="controller"
//           source={usa_states}
//           onChange={handleChangeController}
//           onHighlight={(idx) => setHilitedIdx(idx)}
//         />
//         <input type="text" />
//       </div>
//       <div>
//         <input type="text" />
//         <List
//           id="controlled"
//           highlightedIdx={hilitedIdx}
//           selected={selected}
//           source={usa_states}
//           onChange={handleChangeControlled}
//         />
//         <input type="text" />
//       </div>
//     </div>
//   );
// };

// export const FullyControlledList = () => {
//   const [selected, setSelected] = useState([]);
//   const [hilitedIdx, setHilitedIdx] = useState(-1);

//   const handleChangeController = (evt, newSelected) => {
//     console.log(`handleChangeController`);
//     setSelected(newSelected);
//   };
//   const handleChangeControlled = (idx) => {
//     console.log(`handleChangeControlled`);
//     console.log(`controlled clicked ${idx}`);
//   };

//   const moveUp = () => {
//     setHilitedIdx((val) => Math.max(0, val - 1));
//   };

//   const selectCurrent = () => {
//     const [selectedIdx] = selected;
//     const newSelection =
//       selectedIdx === hilitedIdx || hilitedIdx === -1 ? [] : [hilitedIdx];
//     setSelected(newSelection);
//   };

//   const moveDown = () => {
//     setHilitedIdx((val) => Math.min(usa_states.length - 1, val + 1));
//   };

//   return (
//     <div style={{ height: 600 }}>
//       <div style={{ display: "flex", gap: 12 }}>
//         <Button onClick={moveDown}>Highlight down</Button>
//         <Button onClick={moveUp}>Highlight up</Button>
//         <Button onClick={selectCurrent}>Select</Button>
//       </div>
//       <div style={{ height: 600 }}>
//         <List
//           id="controlled"
//           highlightedIdx={hilitedIdx}
//           selected={selected}
//           source={usa_states}
//           onChange={handleChangeControlled}
//         />
//       </div>
//     </div>
//   );
// };

// export const VirtualizedExample = () => {
//   const data = useMemo(() => {
//     const data = [];
//     for (let i = 0; i < 1000; i++) {
//       data.push(`Item ${i + 1}`);
//     }
//     return data;
//   }, []);

//   const style = {
//     "--list-maxHeight": "300px",
//     boxSizing: "content-box",
//     width: 200,
//   };

//   return (
//     <div style={style}>
//       <VirtualizedList source={data} />
//     </div>
//   );
// };

// export const DeclarativeList2 = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List onChange={(value) => setSelectedValue(value)}>
//           <ListItem
//             onClick={() => console.log("click 1")}
//             style={{ backgroundColor: "red" }}
//           >
//             Value 1
//           </ListItem>
//           <ListItem>Value 2</ListItem>
//           <ListItem onClick={() => console.log("click 3")}>Value 3</ListItem>
//           <ListItem>Value 4</ListItem>
//         </List>>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListUsingDivs = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List onChange={(value) => setSelectedValue(value)}>
//           <div>
//             <span>Value 1</span>
//           </div>
//           <div>
//             <span>Value 2</span>
//           </div>
//           <div>Value 3</div>
//           <div>Value 4</div>
//         </List>>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListWithHeadersUsingDivs = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List
//           onChange={(value) => setSelectedValue(value)}
//           collapsibleHeaders
//         >
//           <div data-header label="Group 1" />
//           <div>
//             <span>Value 1</span>
//           </div>
//           <div>
//             <span>Value 2</span>
//           </div>
//           <div data-header>Group 2</div>
//           <div>Value 3</div>
//           <div>Value 4</div>
//         </List>>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListWithGroups = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List
//           onChange={(value) => setSelectedValue(value)}
//           collapsibleHeaders
//           stickyHeaders
//         >
//           <ListItemGroup title="Group 1">
//             <ListItem>Value 1.1</ListItem>
//             <ListItem>Value 1.2</ListItem>
//             <ListItem>Value 1.3</ListItem>
//             <ListItem>Value 1.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 2">
//             <ListItem>Value 2.1</ListItem>
//             <ListItem>Value 2.2</ListItem>
//             <ListItem>Value 2.3</ListItem>
//             <ListItem>Value 2.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 3">
//             <ListItem>Value 3.1</ListItem>
//             <ListItem>Value 3.2</ListItem>
//             <ListItem>Value 3.3</ListItem>
//             <ListItem>Value 3.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 4">
//             <ListItem>Value 4.1</ListItem>
//             <ListItem>Value 4.2</ListItem>
//             <ListItem>Value 4.3</ListItem>
//             <ListItem>Value 4.4</ListItem>
//             <ListItem>Value 4.5</ListItem>
//             <ListItem>Value 4.6</ListItem>
//             <ListItem>Value 4.7</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 5">
//             <ListItem>Value 5.1</ListItem>
//             <ListItem>Value 5.2</ListItem>
//             <ListItem>Value 5.3</ListItem>
//             <ListItem>Value 5.4</ListItem>
//           </ListItemGroup>
//         </List>>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListWithNestedGroups = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List
//           onChange={(value) => setSelectedValue(value)}
//           collapsibleHeaders
//           stickyHeaders
//         >
//           <ListItemGroup title="Group 1">
//             <ListItem>Value 1.1</ListItem>
//             <ListItem>Value 1.2</ListItem>
//             <ListItem>Value 1.3</ListItem>
//             <ListItem>Value 1.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 2">
//             <ListItemGroup title="Group 2.1">
//               <ListItem>Value 2.1.1</ListItem>
//               <ListItem>Value 2.1.2</ListItem>
//               <ListItem>Value 2.1.3</ListItem>
//               <ListItem>Value 2.1.4</ListItem>
//             </ListItemGroup>
//             <ListItem>Value 2.2</ListItem>
//             <ListItem>Value 2.3</ListItem>
//             <ListItem>Value 2.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 3">
//             <ListItem>Value 3.1</ListItem>
//             <ListItem>Value 3.2</ListItem>
//             <ListItem>Value 3.3</ListItem>
//             <ListItem>Value 3.4</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 4">
//             <ListItem>Value 4.1</ListItem>
//             <ListItem>Value 4.2</ListItem>
//             <ListItem>Value 4.3</ListItem>
//             <ListItem>Value 4.4</ListItem>
//             <ListItem>Value 4.5</ListItem>
//             <ListItem>Value 4.6</ListItem>
//             <ListItem>Value 4.7</ListItem>
//           </ListItemGroup>
//           <ListItemGroup title="Group 5">
//             <ListItem>Value 5.1</ListItem>
//             <ListItem>Value 5.2</ListItem>
//             <ListItem>Value 5.3</ListItem>
//             <ListItem>Value 5.4</ListItem>
//           </ListItemGroup>
//         </List>>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const DeclarativeListWithHeaders = () => {
//   const [selectedValue, setSelectedValue] = useState("");
//   return (
//     <>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List
//           stickyHeaders
//           collapsibleHeaders
//           onChange={(value) => setSelectedValue(value)}
//         >
//           <ListItemHeader id="1">Group 1</ListItemHeader>
//           <ListItem>Value 1.1</ListItem>
//           <ListItem>Value 1.2</ListItem>
//           <ListItem>Value 1.3</ListItem>
//           <ListItem>Value 1.4</ListItem>
//           <ListItemHeader id="2">Group 2</ListItemHeader>
//           <ListItem>Value 2.1</ListItem>
//           <ListItem>Value 2.2</ListItem>
//           <ListItem>Value 2.3</ListItem>
//           <ListItem>Value 2.4</ListItem>
//           <ListItemHeader id="3">Group 3</ListItemHeader>
//           <ListItem>Value 3.1</ListItem>
//           <ListItem>Value 3.2</ListItem>
//           <ListItem>Value 3.3</ListItem>
//           <ListItem>Value 3.4</ListItem>
//         </List>>
//       </div>
//       <div>{usa_states[selectedValue]}</div>
//     </>
//   );
// };

// export const SimpleListDelayedContent = () => {
//   const [source, setSource] = useState([]);

//   const loadSource = () => {
//     console.log("load source");
//     setSource(usa_states);
//   };

//   return (
//     <div
//       style={{
//         alignItems: "flex-start",
//         display: "flex",
//         flexDirection: "column",
//         gap: 6,
//         ...fullWidthHeight,
//       }}
//     >
//       <Button onClick={loadSource}>Load States</Button>
//       <div
//         style={{
//           width: 150,
//           height: 400,
//           maxHeight: 400,
//           position: "relative",
//           border: "solid 1px #ccc",
//         }}
//       >
//         <List source={source} />
//       </div>
//     </div>
//   );
// };

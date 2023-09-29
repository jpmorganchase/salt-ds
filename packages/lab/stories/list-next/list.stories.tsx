import { Meta, StoryFn } from "@storybook/react";
import { ListItemNext, ListNext, ListNextProps } from "../../src";
import {
  Button,
  FlexLayout,
  Input,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { ChangeEvent, KeyboardEvent, SyntheticEvent, useState } from "react";
import { usStateExampleData } from "../assets/exampleData";
import { ArrowDownIcon, ArrowUpIcon } from "@salt-ds/icons";

export default {
  title: "Lab/List Next",
  component: ListNext,
} as Meta<typeof ListNext>;

const getListItems = ({ disabledItems = [] }: { disabledItems?: number[] }) =>
  usStateExampleData.map((item, index) => {
    return (
      <ListItemNext
        key={index}
        disabled={disabledItems.includes(index)}
        id={`controlled-list-item-${index}`}
        value={item}
      >
        {item}
      </ListItemNext>
    );
  });

export const Default: StoryFn<ListNextProps> = ({
  children,
  onChange,
  ...rest
}) => {
  return (
    <ListNext
      aria-label="Declarative List example"
      style={{ height: "150px" }}
      onChange={(e, { value }) => {
        console.log("new selection", value);
        onChange?.(e, { value });
      }}
      {...rest}
    >
      {children ||
        getListItems({
          disabledItems: [1, 5],
        })}
    </ListNext>
  );
};

Default.args = {};

export const Controlled: StoryFn<ListNextProps> = ({ onChange, ...rest }) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(
    0
  );
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined
  );
  const [controls, setControls] = useState<string>("buttons");

  const handleArrowDown = () => {
    const nextIndex = highlightedIndex === undefined ? 0 : highlightedIndex + 1;
    setHighlightedIndex(nextIndex);
  };

  const handleArrowUp = () => {
    const prevIndex =
      highlightedIndex === undefined ? undefined : highlightedIndex - 1;
    setHighlightedIndex(prevIndex);
  };

  const handleSelect = () => {
    if (highlightedIndex !== undefined) {
      setSelectedItem(usStateExampleData[highlightedIndex]);
    }
  };

  const handleClick = (index: number) => {
    setSelectedItem(usStateExampleData[index]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.toLowerCase();
    setSelectedItem(inputValue);
    const firstMatchingItem =
      inputValue.length - 1 >= 0
        ? usStateExampleData.findIndex((item) =>
            item.toLowerCase().includes(inputValue)
          )
        : undefined;
    setHighlightedIndex(firstMatchingItem);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    switch (key) {
      case "ArrowUp":
        event.preventDefault();
        handleArrowUp();
        break;
      case "ArrowDown":
        event.preventDefault();
        handleArrowDown();
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        handleSelect();
        break;
      default:
        break;
    }
  };
  return (
    <FlexLayout
      direction="column"
      gap={1}
      align={"center"}
      style={{ height: "260px" }}
    >
      <ToggleButtonGroup
        aria-label="Controls"
        value={controls}
        onChange={(event: SyntheticEvent<HTMLButtonElement>) =>
          setControls(event.currentTarget.value)
        }
      >
        <ToggleButton aria-label="Button controls" value="buttons">
          buttons
        </ToggleButton>
        <ToggleButton aria-label="Input controls" value="input">
          input
        </ToggleButton>
      </ToggleButtonGroup>
      {controls === "buttons" ? (
        <FlexLayout gap={0}>
          <Button
            disabled={highlightedIndex === usStateExampleData.length - 1}
            onClick={handleArrowDown}
          >
            <ArrowDownIcon />
          </Button>
          <Button
            disabled={!highlightedIndex || highlightedIndex === 0}
            onClick={handleArrowUp}
          >
            <ArrowUpIcon />
          </Button>
          <Button
            disabled={highlightedIndex === undefined}
            onClick={handleSelect}
          >
            Select
          </Button>
        </FlexLayout>
      ) : (
        <Input
          value={selectedItem}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        ></Input>
      )}
      <ListNext
        {...rest}
        aria-label="Controlled List example"
        selected={selectedItem}
        disableFocus
        highlightedItem={
          highlightedIndex === undefined
            ? undefined
            : usStateExampleData[highlightedIndex]
        }
        onChange={(e, { value }) => {
          console.log("new selection", value);
          onChange?.(e, { value });
        }}
        style={{ maxHeight: "150px", width: "100%" }}
      >
        {usStateExampleData.map((item, index) => {
          return (
            <ListItemNext
              key={index}
              onClick={() => handleClick(index)}
              onMouseMove={() => setHighlightedIndex(index)}
              value={item}
              id={`controlled-item-${item}-${index}`}
            >
              {item}
            </ListItemNext>
          );
        })}
      </ListNext>
    </FlexLayout>
  );
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
};

export const DisabledSelected = Default.bind({});
DisabledSelected.args = {
  defaultSelected: "Alaska",
};

export const Empty: StoryFn<ListNextProps> = ({ children, ...rest }) => {
  const [showList, setShowList] = useState(false);
  const listItems = showList
    ? getListItems({
        disabledItems: [1, 5],
      })
    : [];

  return (
    <FlexLayout direction="column" style={{ height: "200px" }}>
      <Button onClick={() => setShowList(!showList)}>Toggle list</Button>

      {listItems.length > 0 ? (
        <ListNext {...rest} aria-label="Populated List example">
          {listItems}
        </ListNext>
      ) : (
        <div>List is empty</div>
      )}
    </FlexLayout>
  );
};

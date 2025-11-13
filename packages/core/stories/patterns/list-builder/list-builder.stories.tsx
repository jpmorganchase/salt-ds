import {
  Button,
  Card,
  Input,
  ListBox,
  Option,
  SplitLayout,
  StackLayout,
  StatusIndicator,
  Text,
  Tooltip,
} from "@salt-ds/core";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  DoubleChevronDownIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  DoubleChevronUpIcon,
  FilterIcon,
  type IconProps,
  SortAlphaAscendIcon,
  SortAlphaDescendIcon,
  SortableAlphaIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEvent, type CSSProperties, useState } from "react";
import { usStateExampleData } from "../../assets/exampleData";
import "./list-builder.stories.css";

export default {
  title: "Patterns/List builder",
} as Meta;

interface ListProps {
  total: number;
  title?: string;
  options?: string[];
  onSelection?: (options: string[]) => void;
  onReorder?: (direction: "up" | "down") => void;
  onFilter?: (filter: string) => void;
  filter: string;
  selected?: string[];
  sortable?: boolean;
  reorderable?: boolean;
  emptyMessage?: string;
  multiselect?: boolean;
}

type SortType = "asc" | "desc" | null;

interface SortIconProps extends IconProps {
  sort: SortType;
}

function SortIcon({ sort, ...rest }: SortIconProps) {
  switch (sort) {
    case "asc":
      return <SortAlphaAscendIcon {...rest} />;
    case "desc":
      return <SortAlphaDescendIcon {...rest} />;
    default:
      return <SortableAlphaIcon {...rest} />;
  }
}

function sortData(data: string[], sort: SortType): string[] {
  if (!sort) return data;
  return data.toSorted((a, b) =>
    sort === "asc" ? a.localeCompare(b) : b.localeCompare(a),
  );
}

function EmptyMessage({ emptyMessage }: { emptyMessage?: string }) {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="info" size={2} />
      <StackLayout gap={1} align="center">
        <Text styleAs="h4">
          <strong>No data available</strong>
        </Text>
        <Text style={{ textAlign: "center" }}>
          {emptyMessage ??
            "Please select at least one of the available options."}
        </Text>
      </StackLayout>
    </StackLayout>
  );
}

interface ListControlsProps {
  onAddAll: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onRemoveAll: () => void;
  orientation: ListBuilderProps["orientation"];
  addDisabled?: boolean;
  removeDisabled?: boolean;
}

function ListControls({
  onAddAll,
  onRemoveAll,
  onAdd,
  onRemove,
  addDisabled,
  removeDisabled,
  orientation,
}: ListControlsProps) {
  return (
    <StackLayout
      style={{ justifyContent: "center" }}
      direction={orientation === "row" ? "column" : "row"}
      gap={1}
    >
      <Button aria-label="Add all to list" onClick={onAddAll}>
        {orientation === "row" ? (
          <DoubleChevronRightIcon aria-hidden />
        ) : (
          <DoubleChevronDownIcon aria-hidden />
        )}
      </Button>
      <Button aria-label="Add to list" onClick={onAdd} disabled={addDisabled}>
        {orientation === "row" ? (
          <ChevronRightIcon aria-hidden />
        ) : (
          <ChevronDownIcon aria-hidden />
        )}
      </Button>
      <Button
        aria-label="Remove from list"
        onClick={onRemove}
        disabled={removeDisabled}
      >
        {orientation === "row" ? (
          <ChevronLeftIcon aria-hidden />
        ) : (
          <ChevronUpIcon aria-hidden />
        )}
      </Button>
      <Button aria-label="Remove all from list" onClick={onRemoveAll}>
        {orientation === "row" ? (
          <DoubleChevronLeftIcon aria-hidden />
        ) : (
          <DoubleChevronUpIcon aria-hidden />
        )}
      </Button>
    </StackLayout>
  );
}

function List({
  title,
  total,
  options = [],
  onSelection,
  selected = [],
  sortable,
  reorderable,
  onReorder,
  onFilter,
  filter,
  emptyMessage,
  multiselect,
}: ListProps) {
  const [sort, setSort] = useState<SortType>(null);
  const sortedOptions = sortData(options, sort);

  const handleMoveUp = () => {
    onReorder?.("up");
  };

  const handleMoveDown = () => {
    onReorder?.("down");
  };

  return (
    <StackLayout
      as={Card}
      className="listBuilderList"
      style={{ "--saltCard-padding": "0", flex: 1 } as CSSProperties}
      gap={0}
    >
      <StackLayout style={{ padding: "var(--salt-spacing-100)" }} gap={1}>
        <SplitLayout
          align="center"
          startItem={
            <Text color="secondary" styleAs="label">
              <strong>
                {title} ({total})
              </strong>
            </Text>
          }
          endItem={
            <StackLayout direction="row" gap={1}>
              {sortable && (
                <Tooltip content="Sort alphabetically">
                  <Button
                    appearance="transparent"
                    onClick={() =>
                      setSort((old) => {
                        switch (old) {
                          case "asc":
                            return "desc";
                          case "desc":
                            return null;
                          default:
                            return "asc";
                        }
                      })
                    }
                    aria-label="Sort alphabetically"
                  >
                    <SortIcon sort={sort} aria-hidden />
                  </Button>
                </Tooltip>
              )}
              {reorderable && (
                <>
                  <Tooltip content="Move items up">
                    <Button
                      disabled={selected.length === 0}
                      appearance="transparent"
                      onClick={handleMoveUp}
                      aria-label="Move items up"
                    >
                      <ChevronUpIcon aria-hidden />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Move items down">
                    <Button
                      disabled={selected.length === 0}
                      appearance="transparent"
                      onClick={handleMoveDown}
                      aria-label="Move items down"
                    >
                      <ChevronDownIcon aria-hidden />
                    </Button>
                  </Tooltip>
                </>
              )}
            </StackLayout>
          }
        />
        <Input
          style={{
            visibility:
              sortedOptions.length === total && sortedOptions.length === 0
                ? "hidden"
                : undefined,
          }}
          aria-label="Filter"
          value={filter}
          startAdornment={<FilterIcon />}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onFilter?.(event.target.value)
          }
          endAdornment={
            filter && (
              <Button
                appearance="transparent"
                aria-label="Clear filter"
                onClick={() => onFilter?.("")}
              >
                <CloseIcon aria-hidden />
              </Button>
            )
          }
        />
      </StackLayout>
      {sortedOptions.length > 0 ? (
        <ListBox
          multiselect={multiselect}
          onSelectionChange={(_, newSelected) => {
            onSelection?.(newSelected);
          }}
          selected={selected}
        >
          {sortedOptions.map((option, index) => (
            <Option key={option} value={option} />
          ))}
        </ListBox>
      ) : (
        <EmptyMessage emptyMessage={emptyMessage} />
      )}
    </StackLayout>
  );
}

interface ListBuilderProps {
  multiselect?: boolean;
  orientation?: "row" | "column";
}

const ListBuilder: StoryFn<ListBuilderProps> = ({
  multiselect,
  orientation = "row",
}) => {
  const [picked, setPicked] = useState<string[]>([]);
  const availableOptions = usStateExampleData.filter(
    (state) => !picked.includes(state),
  );

  const [optionsToAdd, setOptionsToAdd] = useState<string[]>([]);
  const [optionsToRemove, setOptionsToRemove] = useState<string[]>([]);

  const [addFilter, setAddFilter] = useState("");
  const [removeFilter, setRemoveFilter] = useState("");

  const filteredAvailableOptions = availableOptions.filter((option) =>
    addFilter !== ""
      ? option.toLowerCase().startsWith(addFilter.toLowerCase())
      : true,
  );

  const filteredPickedOptions = picked.filter((option) =>
    removeFilter !== ""
      ? option.toLowerCase().startsWith(removeFilter.toLowerCase())
      : true,
  );

  const handlePickedReorder = (direction: "up" | "down") => {
    const arr = [...picked];
    if (direction === "up") {
      picked.forEach((item, index) => {
        if (optionsToRemove.includes(item)) {
          const prevIndex = Math.max(0, index - 1);
          const temp = arr[prevIndex];
          if (!optionsToRemove.includes(temp)) {
            arr[prevIndex] = item;
            arr[index] = temp;
          }
        }
      });
    } else {
      for (let index = picked.length - 1; index >= 0; index--) {
        const item = picked[index];
        if (optionsToRemove.includes(item)) {
          const nextIndex = Math.min(arr.length - 1, index + 1);
          const temp = arr[nextIndex];
          if (!optionsToRemove.includes(temp)) {
            arr[nextIndex] = item;
            arr[index] = temp;
          }
        }
      }
    }
    setPicked(arr);
  };

  return (
    <StackLayout
      className={`container-${orientation}`}
      direction={orientation}
      gap={1}
    >
      <List
        title="Available"
        options={filteredAvailableOptions}
        onSelection={(options) => setOptionsToAdd(options)}
        filter={addFilter}
        onFilter={(filter) => setAddFilter(filter)}
        total={availableOptions.length}
        selected={optionsToAdd}
        sortable
        emptyMessage="There are no options left to display"
        multiselect={multiselect}
      />
      <ListControls
        orientation={orientation}
        onAddAll={() => {
          setPicked((old) => old.concat(filteredAvailableOptions));
          setOptionsToAdd([]);
          setOptionsToRemove([]);
        }}
        onAdd={() => {
          setPicked((old) => old.concat(optionsToAdd));
          setOptionsToAdd([]);
        }}
        addDisabled={optionsToAdd.length === 0}
        onRemove={() => {
          setPicked((old) =>
            old.filter((item) => !optionsToRemove.includes(item)),
          );
          setOptionsToRemove([]);
        }}
        removeDisabled={optionsToRemove.length === 0}
        onRemoveAll={() => {
          setPicked([]);
          setOptionsToAdd([]);
          setOptionsToRemove([]);
        }}
      />
      <List
        title="Visible"
        options={filteredPickedOptions}
        onSelection={(options) => {
          setOptionsToRemove(options);
        }}
        total={picked.length}
        filter={removeFilter}
        onFilter={(filter) => setRemoveFilter(filter)}
        onReorder={handlePickedReorder}
        selected={optionsToRemove}
        reorderable
        multiselect={multiselect}
      />
    </StackLayout>
  );
};

export const SingleSelect = ListBuilder.bind({});
export const Multiselect = ListBuilder.bind({});
Multiselect.args = { multiselect: true };

export const Vertical = ListBuilder.bind({});
Vertical.args = { orientation: "column" };
Vertical.parameters = {
  layout: "padded",
};

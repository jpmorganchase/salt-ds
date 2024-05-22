import { Meta, StoryFn } from "@storybook/react";
import {
  StackLayout,
  Card,
  Button,
  SplitLayout,
  Text,
  ListBox,
  Option,
  Input,
  StatusIndicator,
} from "@salt-ds/core";
import { ChangeEvent, CSSProperties, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  FilterIcon,
  IconProps,
  SortableAlphaIcon,
  SortAlphaAscendIcon,
  SortAlphaDescendIcon,
} from "@salt-ds/icons";
import { usStateExampleData } from "../../assets/exampleData";

export default {
  title: "Patterns/List builder",
} as Meta;

interface ListProps {
  total: number;
  title?: string;
  options?: string[];
  onSelection?: (options: string[]) => void;
  onReorder?: (options: string[]) => void;
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

function sortData(data: string[], sort: SortType) {
  if (!sort) return data;
  return data.sort((a, b) =>
    sort === "asc" ? a.localeCompare(b) : b.localeCompare(a)
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

  const filteredOptions = sortData(options, sort);

  const handleMoveUp = () => {
    let arr = [...options];

    options.forEach((item, index) => {
      if (selected.includes(item)) {
        const prevIndex = Math.max(0, index - 1);
        let temp = arr[prevIndex];
        if (!selected.includes(temp)) {
          arr[prevIndex] = item;
          arr[index] = temp;
        }
      }
    });

    onReorder?.(arr);
  };

  const handleMoveDown = () => {
    let arr = [...options];

    for (let index = options.length - 1; index >= 0; index--) {
      const item = options[index];
      if (selected.includes(item)) {
        const nextIndex = Math.min(arr.length - 1, index + 1);
        let temp = arr[nextIndex];
        if (!selected.includes(temp)) {
          arr[nextIndex] = item;
          arr[index] = temp;
        }
      }
    }
    onReorder?.(arr);
  };

  return (
    <StackLayout
      as={Card}
      style={{ "--saltCard-padding": "0", width: 228 } as CSSProperties}
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
                <Button
                  variant="secondary"
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
              )}
              {reorderable && (
                <>
                  <Button
                    disabled={selected.length === 0}
                    variant="secondary"
                    onClick={handleMoveUp}
                    aria-label="Move items up"
                  >
                    <ChevronUpIcon aria-hidden />
                  </Button>
                  <Button
                    disabled={selected.length === 0}
                    variant="secondary"
                    onClick={handleMoveDown}
                    aria-label="Move items down"
                  >
                    <ChevronDownIcon aria-hidden />
                  </Button>
                </>
              )}
            </StackLayout>
          }
        />
        <Input
          style={{
            visibility:
              filteredOptions.length == total && filteredOptions.length == 0
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
                variant="secondary"
                aria-label="Clear filter"
                onClick={() => onFilter?.("")}
              >
                <CloseIcon aria-hidden />
              </Button>
            )
          }
        />
      </StackLayout>
      {filteredOptions.length > 0 ? (
        <ListBox
          borderless
          multiselect={multiselect}
          onSelectionChange={(_, newSelected) => {
            onSelection?.(newSelected);
          }}
          selected={selected}
        >
          {filteredOptions.map((option) => (
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
}

const ListBuilder: StoryFn<ListBuilderProps> = ({ multiselect }) => {
  const [picked, setPicked] = useState<string[]>([]);
  const availableOptions = usStateExampleData.filter(
    (state) => !picked.includes(state)
  );

  const [optionsToAdd, setOptionsToAdd] = useState<string[]>([]);
  const [optionsToRemove, setOptionsToRemove] = useState<string[]>([]);

  const [addFilter, setAddFilter] = useState("");
  const [removeFilter, setRemoveFilter] = useState("");

  const filteredAvailableOptions = availableOptions.filter((option) =>
    addFilter != ""
      ? option.toLowerCase().startsWith(addFilter.toLowerCase())
      : true
  );

  const filteredPickedOptions = picked.filter((option) =>
    removeFilter != ""
      ? option.toLowerCase().startsWith(removeFilter.toLowerCase())
      : true
  );

  return (
    <StackLayout direction="row" gap={1} style={{ height: 266 }}>
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
      <StackLayout
        style={{ justifyContent: "center" }}
        direction="column"
        gap={1}
      >
        <Button
          aria-label="Add all to list"
          onClick={() => {
            setPicked(filteredAvailableOptions);
            setOptionsToAdd([]);
            setOptionsToRemove([]);
          }}
        >
          <DoubleChevronRightIcon aria-hidden />
        </Button>
        <Button
          aria-label="Add to list"
          onClick={() => {
            setPicked((old) => old.concat(optionsToAdd));
            setOptionsToAdd([]);
          }}
          disabled={optionsToAdd.length === 0}
        >
          <ChevronRightIcon aria-hidden />
        </Button>
        <Button
          aria-label="Remove from list"
          onClick={() => {
            setPicked((old) =>
              old.filter((item) => !optionsToRemove.includes(item))
            );
            setOptionsToRemove([]);
          }}
          disabled={optionsToRemove.length === 0}
        >
          <ChevronLeftIcon aria-hidden />
        </Button>
        <Button
          aria-label="Remove all from list"
          onClick={() => {
            setPicked([]);
            setOptionsToAdd([]);
            setOptionsToRemove([]);
          }}
        >
          <DoubleChevronLeftIcon aria-hidden />
        </Button>
      </StackLayout>
      <List
        title="Visible"
        options={filteredPickedOptions}
        onSelection={(options) => {
          setOptionsToRemove(options);
        }}
        total={picked.length}
        filter={removeFilter}
        onFilter={(filter) => setRemoveFilter(filter)}
        onReorder={(options) => setPicked(options)}
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

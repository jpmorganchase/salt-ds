import {
  Button,
  ComboBox,
  Option,
  OptionGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";
import { type ChangeEvent, type ReactNode, useState } from "react";
import "./search.stories.css";

export default {
  title: "Patterns/Search",
} as Meta;

const components = [
  "Accordion",
  "AG Grid theme",
  "Avatar",
  "Badge",
  "Banner",
  "Border layout",
  "Button",
  "Card",
  "Checkbox",
  "Combo box",
  "Country symbol",
  "Dialog",
  "Divider",
  "Drawer",
  "Dropdown",
  "File drop zone",
  "Flex layout",
  "Flow layout",
  "Form field",
  "Grid layout",
  "Icon",
  "Input",
  "Link",
  "List box",
  "Menu",
  "Multiline input",
  "Navigation item",
  "Overlay",
  "Pagination",
  "Panel",
  "Parent-child layout",
  "Pill",
  "Progress",
  "Radio button",
  "Salt provider",
  "Scrim",
  "Segmented button group",
  "Semantic icon provider",
  "Skip link",
  "Spinner",
  "Split layout",
  "Stack layout",
  "Status indicator",
  "Switch",
  "Tag",
  "Text",
  "Toast",
  "Toggle button",
  "Tooltip",
];
const patterns = [
  "App header",
  "Breadcrumbs",
  "Button bar",
  "Contact details",
  "Content status",
  "Dashboards",
  "File upload",
  "Forms",
  "Header block",
  "International address form",
  "International phone number",
  "List builder",
  "List filtering",
  "Menu button",
  "Metric",
  "Navigation",
  "Preferences dialog",
  "Selectable card",
  "Split button",
  "Vertical navigation",
];

function performSearch(
  items: string[],
  searchValue: string,
): { results: string[]; invalid: boolean } {
  if (searchValue.length < 3) {
    return {
      results: [],
      invalid: true,
    };
  }

  return {
    invalid: false,
    results: items.filter((item) =>
      item.toLowerCase().includes(searchValue.toLowerCase()),
    ),
  };
}

function StatusOption({ children }: { children: ReactNode }) {
  return (
    <div role="option" aria-selected="false" className="statusOption">
      {children}
    </div>
  );
}

export const Simple: StoryFn = () => {
  const [searchValue, setSearchValue] = useState("");

  const { results, invalid } = performSearch(components, searchValue);

  return (
    <ComboBox
      style={{ width: "20em" }}
      value={searchValue}
      selected={[]}
      startAdornment={<SearchIcon aria-hidden />}
      endAdornment={
        searchValue && (
          <Button
            appearance="transparent"
            aria-label="Clear search"
            onClick={() => setSearchValue("")}
          >
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
      }}
      onSelectionChange={(_, newSelected) => {
        setSearchValue(newSelected[0]);
      }}
    >
      {!invalid &&
        results.length > 0 &&
        results.map((component) => (
          <Option key={component} value={component} />
        ))}
      {!invalid && results.length === 0 && (
        <StatusOption>
          No results found for &quot;{searchValue}&quot;
        </StatusOption>
      )}
    </ComboBox>
  );
};

const categoryLabelMap: Record<string, string> = {
  component: "Component",
  pattern: "Pattern",
};

const groupedOptions: GroupOption[] = [
  ...components.map((c) => ({ title: c, type: "component" })),
  ...patterns.map((p) => ({ title: p, type: "pattern" })),
];

type GroupOption = { title: string; type: string };

function performGroupedSearch(
  items: GroupOption[],
  searchValue: string,
): { results: GroupOption[]; invalid: boolean } {
  if (searchValue.length < 3) {
    return {
      results: [],
      invalid: true,
    };
  }

  return {
    invalid: false,
    results: items.filter((item) =>
      item.title.toLowerCase().includes(searchValue.toLowerCase()),
    ),
  };
}

export const Grouped: StoryFn = () => {
  const [searchValue, setSearchValue] = useState("");

  const { results, invalid } = performGroupedSearch(
    groupedOptions,
    searchValue,
  );

  // @ts-ignore
  const groupedResults: Record<string, GroupOption[]> = Object.groupBy(
    results,
    ({ type }: GroupOption) => type,
  );

  return (
    <ComboBox<GroupOption>
      style={{ width: "20em" }}
      value={searchValue}
      selected={[]}
      startAdornment={<SearchIcon aria-hidden />}
      endAdornment={
        searchValue && (
          <Button
            appearance="transparent"
            aria-label="Clear search"
            onClick={() => setSearchValue("")}
          >
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
      }}
      onSelectionChange={(_, newSelected) => {
        setSearchValue(newSelected[0].title);
      }}
      valueToString={(option) => option.title}
    >
      {!invalid &&
        results.length > 0 &&
        Object.entries(groupedResults).map(([category, results]) => (
          <OptionGroup label={categoryLabelMap[category]} key={category}>
            {results.slice(0, 5).map((result) => (
              <Option value={result} key={result.title}>
                <StackLayout gap={0.5} align="start">
                  <Text>{result.title}</Text>
                </StackLayout>
              </Option>
            ))}
          </OptionGroup>
        ))}
      {!invalid && results.length === 0 && (
        <StatusOption>
          No results found for &quot;{searchValue}&quot;
        </StatusOption>
      )}
    </ComboBox>
  );
};

export const WithHistory: StoryFn = () => {
  const [searchValue, setSearchValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const { results, invalid } = performSearch(components, searchValue);

  return (
    <ComboBox
      style={{ width: "20em" }}
      value={searchValue}
      startAdornment={<SearchIcon aria-hidden />}
      selected={[]}
      endAdornment={
        searchValue && (
          <Button
            appearance="transparent"
            aria-label="Clear search"
            onClick={() => setSearchValue("")}
          >
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
      }}
      onSelectionChange={(_, newSelected) => {
        setSearchValue(newSelected[0]);
        setHistory((prev) => prev.concat(newSelected));
      }}
    >
      {history.length > 0 && (
        <OptionGroup label="Recent">
          {history.map((item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </OptionGroup>
      )}
      {!invalid && (
        <OptionGroup label="Results">
          {!invalid &&
            results.length > 0 &&
            results.map((component) => (
              <Option key={component} value={component} />
            ))}
          {!invalid && results.length === 0 && (
            <StatusOption>
              No results found for &quot;{searchValue}&quot;
            </StatusOption>
          )}
        </OptionGroup>
      )}
    </ComboBox>
  );
};

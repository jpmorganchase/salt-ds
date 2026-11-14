import {
  createSearchIndex,
  highlight,
  type MosaicSearchIndex,
  type SearchRecord,
  type SearchResult,
} from "@jpmorganchase/mosaic-site-middleware/search";
import {
  Button,
  ComboBox,
  capitalize,
  Option,
  OptionGroup,
  Text,
} from "@salt-ds/core";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";
import styles from "./Search.module.css";

/** Written by Mosaic's SearchIndexPlugin and copied to `public/`. */
export const SEARCH_RECORDS_URL = "/search-records.json";

// A component's tabs are one result, linking to the tab that matched best.
const COMPONENT_TAB = /\/(index|usage|examples|accessibility)$/;
const RESULTS_PER_CATEGORY = 5;

async function loadSearchIndex(url: string): Promise<MosaicSearchIndex> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  const { records } = (await response.json()) as { records: SearchRecord[] };
  return createSearchIndex(
    // The GitHub release pages aren't part of site search.
    records.filter((record) => record.route.startsWith("/salt/")),
    {
      groupBy: (record) => record.route.replace(COMPONENT_TAB, ""),
      pageRank: (record) => {
        if (record.route.endsWith("/index")) return 0;
        return record.route.endsWith("/usage") ? 1 : 2;
      },
      // The docs use US spelling.
      synonyms: [["colour", "color"]],
    },
  );
}

/** "components", "foundations" and so on, from `/salt/<category>/...`. */
const categoryOf = (route: string) =>
  capitalize(route.split("/")[2]?.split("-").join(" ") ?? "");

function SearchResultOption({ result }: { result: SearchResult }) {
  const heading = result.headings[result.headings.length - 1];
  return (
    <Option className={styles.result} value={result.href}>
      <Text>
        {result.title}
        {heading && ` › ${heading}`}
      </Text>
      {result.snippet && (
        <Text
          styleAs="label"
          color="secondary"
          className={styles.resultDescription}
        >
          {highlight(result.snippet, result.terms).map((segment, index) =>
            segment.match ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: segments are split from fixed text and never reorder
              <strong key={index}>{segment.text}</strong>
            ) : (
              segment.text
            ),
          )}
        </Text>
      )}
    </Option>
  );
}

export function Search(props: ComponentPropsWithoutRef<"search">) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const query = useDeferredValue(value).trim();
  // Download the records the first time the reader focuses search.
  const [wantsIndex, setWantsIndex] = useState(false);
  const { data: searchIndex, error } = useSWR(
    wantsIndex ? SEARCH_RECORDS_URL : null,
    loadSearchIndex,
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWantsIndex(true);
    setValue(event.target.value);
  };

  const handleSelectionChange = (_event: SyntheticEvent, href: string[]) => {
    setValue("");
    router.push(href[0]);
  };

  const results = useMemo(() => {
    const byCategory: Record<string, SearchResult[]> = {};
    if (!searchIndex || query === "") {
      return byCategory;
    }
    for (const result of searchIndex.search(query, {
      limit: 20,
      sectionsPerResult: 0,
    })) {
      const category = categoryOf(result.route);
      if (category) {
        byCategory[category] ??= [];
        byCategory[category].push(result);
      }
    }
    return byCategory;
  }, [searchIndex, query]);

  const status =
    query === ""
      ? undefined
      : error
        ? "Search is unavailable"
        : !searchIndex
          ? "Loading search…"
          : Object.keys(results).length === 0 && query.length > 2
            ? `No results found for "${query}"`
            : undefined;

  return (
    <search {...props}>
      <ComboBox
        inputProps={{
          "aria-label": "Site Search",
        }}
        onChange={handleChange}
        onFocus={() => setWantsIndex(true)}
        onSelectionChange={handleSelectionChange}
        startAdornment={<SearchIcon aria-hidden />}
        bordered
        endAdornment={
          value && (
            <Button
              aria-label="Clear search"
              appearance="transparent"
              onClick={() => setValue("")}
            >
              <CloseIcon aria-hidden />
            </Button>
          )
        }
        value={value}
        placeholder="Search"
      >
        {status ? (
          <div
            className={styles.statusOption}
            role="option"
            aria-selected="false"
          >
            {status}
          </div>
        ) : (
          Object.entries(results).map(([category, categoryResults]) => (
            <OptionGroup label={category} key={category}>
              {categoryResults.slice(0, RESULTS_PER_CATEGORY).map((result) => (
                <SearchResultOption result={result} key={result.id} />
              ))}
            </OptionGroup>
          ))
        )}
      </ComboBox>
    </search>
  );
}

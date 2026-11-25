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
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  useContext,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import { SearchNavigationContext } from "../../utils/searchNavigationContext";
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
  return createSearchIndex(records, {
    groupBy: (record) => record.route.replace(COMPONENT_TAB, ""),
    pageRank: (record) => {
      if (record.route.endsWith("/index")) return 0;
      return record.route.endsWith("/usage") ? 1 : 2;
    },
    // The docs use US spelling.
    synonyms: [["colour", "color"]],
  });
}

/** "components", "foundations" and so on, from `/salt/<category>/...`. */
const categoryOf = (route: string) =>
  capitalize(route.split("/")[2]?.split("-").join(" ") ?? "");

function SearchResultOption({ result }: { result: SearchResult }) {
  const heading = result.headings[result.headings.length - 1];
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Option
      className={styles.result}
      value={result.href}
      aria-labelledby={titleId}
      aria-describedby={result.snippet ? descriptionId : undefined}
    >
      <Text id={titleId}>
        {result.title}
        {heading && ` › ${heading}`}
      </Text>
      {result.snippet && (
        <Text
          id={descriptionId}
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
  const searchNavigation = useContext(SearchNavigationContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
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
    if (!href[0]) return;
    setValue("");
    const anchor =
      searchNavigation?.request(href[0], inputRef.current) ?? false;
    router.push(href[0], { scroll: !anchor });
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

  const resultCount = Object.values(results).reduce(
    (count, categoryResults) =>
      count + Math.min(categoryResults.length, RESULTS_PER_CATEGORY),
    0,
  );

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

  const feedback =
    open && query !== "" && query === value.trim()
      ? (status ??
        (resultCount > 0
          ? `${resultCount} ${resultCount === 1 ? "result" : "results"} for "${query}"`
          : ""))
      : "";

  useEffect(() => {
    setAnnouncement("");
    if (!feedback) return;

    // Wait for a pause in typing; transient loading and intermediate queries
    // should not interrupt the reader with a stream of announcements.
    const timeout = window.setTimeout(() => setAnnouncement(feedback), 300);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  return (
    <search {...props} className={clsx(styles.root, props.className)}>
      <ComboBox
        inputRef={inputRef}
        inputProps={{
          "aria-label": "Site Search",
          "aria-autocomplete": "list",
        }}
        OverlayProps={{ "aria-label": "Search results" }}
        open={open}
        onOpenChange={setOpen}
        onChange={handleChange}
        onFocus={() => setWantsIndex(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          // Empty/loading feedback is outside the listbox, so it also needs
          // dismissal when ComboBox has no popup of its own to dismiss.
          if (event.key === "Escape") setOpen(false);
        }}
        onSelectionChange={handleSelectionChange}
        selectOnTab={false}
        selected={[]}
        startAdornment={<SearchIcon aria-hidden />}
        bordered
        endAdornment={
          value && (
            <Button
              aria-label="Clear search"
              appearance="transparent"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
            >
              <CloseIcon aria-hidden />
            </Button>
          )
        }
        value={value}
        placeholder="Search"
      >
        {!status &&
          Object.entries(results).map(([category, categoryResults]) => (
            <OptionGroup label={category} key={category}>
              {categoryResults.slice(0, RESULTS_PER_CATEGORY).map((result) => (
                <SearchResultOption result={result} key={result.id} />
              ))}
            </OptionGroup>
          ))}
      </ComboBox>
      {open && status && <div className={styles.status}>{status}</div>}
      <div className="salt-visuallyHidden" role="status" aria-atomic="true">
        {announcement}
      </div>
    </search>
  );
}

import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from "rxjs";
import { createHandler, createHook } from "../../grid";

export type TextFilterFn = (value: string | undefined) => boolean;

export class TextColumnFilterModel {
  public readonly operations: string[] = [
    "Contains",
    "Not Contains",
    "Equals",
    "Not Equal",
    "Starts With",
    "Ends With",
    "Blank",
    "Not Blank",
  ];

  public readonly operation$: BehaviorSubject<string>;
  public readonly useOperation: () => string;
  public readonly setOperation: (operation: string) => void;

  public readonly query$: BehaviorSubject<string>;
  public readonly useQuery: () => string;
  public readonly setQuery: (query: string) => void;

  public readonly filterFn$: BehaviorSubject<TextFilterFn | undefined>;
  public readonly isFilterApplied$: BehaviorSubject<boolean>;
  public readonly useIsFilterApplied: () => boolean;

  constructor() {
    this.operation$ = new BehaviorSubject("Contains");
    this.useOperation = createHook(this.operation$);
    this.setOperation = createHandler(this.operation$);

    this.query$ = new BehaviorSubject("");
    this.useQuery = createHook(this.query$);
    this.setQuery = createHandler(this.query$);

    this.filterFn$ = new BehaviorSubject<TextFilterFn | undefined>(undefined);
    this.isFilterApplied$ = new BehaviorSubject<boolean>(false);

    combineLatest([this.operation$, this.query$])
      .pipe(
        map(([operation, query]): TextFilterFn | undefined => {
          if (query.length < 1) {
            return undefined;
          }
          switch (operation) {
            case "Contains":
              return (value: string | undefined) =>
                value != undefined && value.includes(query);
            case "Not Contains":
              return (value: string | undefined) =>
                !value || !value.includes(query);
            case "Equals":
              return (value: string | undefined) => value === query;
            case "Not Equal":
              return (value: string | undefined) => value !== query;
            case "Starts With":
              return (value: string | undefined) =>
                value != undefined && value.startsWith(query);
            case "Ends With":
              return (value: string | undefined) =>
                value != undefined && value.endsWith(query);
            case "Blank":
              return (value: string | undefined) => !value || value === "";
            case "Not Blank":
              return (value: string | undefined) =>
                value != undefined && value.length > 0;
            default:
              return undefined;
          }
        })
      )
      .subscribe(this.filterFn$);

    this.filterFn$
      .pipe(
        map((fn) => fn != undefined),
        distinctUntilChanged()
      )
      .subscribe(this.isFilterApplied$);

    this.useIsFilterApplied = createHook(this.isFilterApplied$);
  }
}

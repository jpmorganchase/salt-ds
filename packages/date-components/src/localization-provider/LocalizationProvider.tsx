import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { createContext, useContext, useMemo } from "react";

const MIN_DATE = "1900-01-01T00:00:00.000";
const MAX_DATE = "2099-12-31T00:00:00.000";

export interface LocalizationProviderValue<
  TDate extends DateFrameworkType = DateFrameworkType,
> {
  defaultDates: {
    minDate: TDate;
    maxDate: TDate;
  };
  dateAdapter: SaltDateAdapter<TDate>;
}

/**
 * Props for the LocalizationProvider component.
 *
 * @template TDate - The type of the date object used in the provider.
 * @template TLocale - The type of the locale, defaulting to string.
 */
export interface LocalizationProviderProps<
  TDate extends DateFrameworkType = DateFrameworkType,
  TLocale = string,
> {
  /**
   * The child components to be rendered within the provider.
   */
  children?: React.ReactNode;

  /**
   * The instance of the date library being used.
   */
  // biome-ignore lint/suspicious/noExplicitAny: date framework
  instance?: any;

  /**
   * The date adapter class, which provides methods for date manipulation and formatting.
   * This should be a constructor for a class implementing the SaltDateAdapter interface.
   */
  DateAdapter: new (
    // biome-ignore lint/suspicious/noExplicitAny: date framework
    ...args: any
  ) => SaltDateAdapter<TDate, TLocale>;

  /**
   * The locale to be used for date formatting and manipulation.
   */
  locale?: TLocale;

  /**
   * The minimum date allowed for all date selections.
   * Defaults to January 1, 1900.
   */
  minDate?: TDate;

  /**
   * The maximum date allowed for all date selections.
   * Defaults to December 31, 2099.
   */
  maxDate?: TDate;
}

export type LocalizationProviderContext<
  TDate extends DateFrameworkType = DateFrameworkType,
> = {
  [K in keyof LocalizationProviderValue<TDate>]:
    | LocalizationProviderValue<TDate>[K]
    | null;
};

export const LocalizationProviderContext =
  // biome-ignore lint/suspicious/noExplicitAny: date frameworl
  createContext<LocalizationProviderValue<any> | null>(null);

if (process.env.NODE_ENV !== "production") {
  LocalizationProviderContext.displayName = "LocalizationProviderContext";
}

export const LocalizationProvider = function LocalizationProvider<
  TDate extends DateFrameworkType = DateFrameworkType,
  TLocale = undefined,
>(props: LocalizationProviderProps<TDate, TLocale>) {
  const { children, DateAdapter, instance, locale, minDate, maxDate } = props;

  const dateAdapter = useMemo(() => {
    return new DateAdapter({
      locale,
      instance,
    });
  }, [DateAdapter, instance, locale]);

  const defaultDates: LocalizationProviderValue<TDate>["defaultDates"] =
    useMemo(
      () => ({
        minDate: minDate || dateAdapter.date(MIN_DATE),
        maxDate: maxDate || dateAdapter.date(MAX_DATE),
      }),
      [dateAdapter, minDate, maxDate],
    );

  const contextValue: LocalizationProviderValue<TDate> = useMemo(() => {
    return {
      dateAdapter,
      defaultDates,
    };
  }, [dateAdapter, defaultDates]);

  return (
    <LocalizationProviderContext.Provider value={contextValue}>
      {children}
    </LocalizationProviderContext.Provider>
  );
};

/**
 * Custom hook to access the localization context.
 *
 * This hook provides access to the localization settings and utilities
 * within the `LocalizationProviderContext`. It should be used within a
 * component that is a descendant of `LocalizationProviderContext.Provider`.
 *
 * @template TDate - The type of the date object used in the localization context.
 *
 * @returns The localization provider value, which includes date manipulation and formatting utilities.
 *
 * @throws Will throw an error if the hook is used outside of a `LocalizationProviderContext.Provider`.
 */
export const useLocalization = <
  TDate extends DateFrameworkType = DateFrameworkType,
>(): LocalizationProviderValue<TDate> => {
  const localization = useContext(LocalizationProviderContext);
  if (!localization) {
    throw new Error(
      "useLocalization should be called inside LocalizationProviderContext.Provider",
    );
  }
  return localization;
};

import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  LocalizationProvider as _LocalizationProvider,
  useLocalization as _useLocalization,
  type LocalizationProviderProps,
  type LocalizationProviderValue,
} from "@salt-ds/date-components";
import { deprecatedFunction } from "../utils/deprecatedExport";

const KEY = "@salt-ds/lab/localization-provider";
const MSG =
  "@salt-ds/lab 'localization-provider' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.";

const _warnOnce = deprecatedFunction(() => {}, KEY, MSG);

export function LocalizationProvider<
  TDate extends DateFrameworkType = DateFrameworkType,
  TLocale = undefined,
>(props: LocalizationProviderProps<TDate, TLocale>) {
  _warnOnce();
  return _LocalizationProvider(props);
}
LocalizationProvider.displayName = "LocalizationProvider";

export function useLocalization<
  TDate extends DateFrameworkType = DateFrameworkType,
>(): LocalizationProviderValue<TDate> {
  _warnOnce();
  return _useLocalization<TDate>();
}

export type {
  LocalizationProviderContext as LocalizationProviderContextType,
  LocalizationProviderProps,
  LocalizationProviderValue,
} from "@salt-ds/date-components";
// Context object — re-export directly
export { LocalizationProviderContext } from "@salt-ds/date-components";

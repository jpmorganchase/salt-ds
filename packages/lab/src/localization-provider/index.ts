import { warnOnce } from "../utils/deprecate";

warnOnce({
  key: "@salt-ds/lab/localization-provider",
  message:
	"@salt-ds/lab 'localization-provider' exports are deprecated and will be removed in a future release. Import from @salt-ds/date-components instead.",
});

export {
  LocalizationProvider,
  LocalizationProviderContext,
  useLocalization,
} from "@salt-ds/date-components";

export type {
  LocalizationProviderProps,
  LocalizationProviderValue,
  LocalizationProviderContext as LocalizationProviderContextType,
} from "@salt-ds/date-components";

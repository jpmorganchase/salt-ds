import type { Decorator } from "@storybook/react";
import "dayjs/locale/en";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { LocalizationProvider } from "@salt-ds/lab";
import { enUS as dateFnsEnUs } from "date-fns/locale";

// biome-ignore lint/suspicious/noExplicitAny: Date framework adapter
const dateAdapterMap: Record<string, any> = {
  moment: AdapterMoment,
  dayjs: AdapterDayjs,
  "date-fns": AdapterDateFns,
  luxon: AdapterLuxon,
};

const getDefaultLocale = (dateAdapter: string) => {
  if (dateAdapter === "date-fns") {
    return dateFnsEnUs;
  }
  if (dateAdapter === "dayjs") {
    return "en-US";
  }
  return "en";
};

/** A storybook decorator that provides the Localization context (date support etc.) */
export const withLocalization: Decorator = (Story, context) => {
  const dateAdapter =
    context.parameters?.dateAdapter ?? context.globals?.dateAdapter;
  const dateLocale =
    context.parameters?.dateLocale ?? context.globals?.dateLocale;
  const locale = dateLocale ?? getDefaultLocale(dateAdapter);
  return (
    <LocalizationProvider
      DateAdapter={dateAdapterMap[dateAdapter]}
      locale={locale}
    >
      <Story key={dateAdapter} {...context} />
    </LocalizationProvider>
  );
};

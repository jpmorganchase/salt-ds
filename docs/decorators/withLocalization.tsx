import type { Decorator } from "@storybook/react";
import "dayjs/locale/en";
import { enUS as dateFnsEnUs } from "date-fns/locale";

import {
  AdapterDateFns,
  AdapterDayjs,
  AdapterLuxon,
  AdapterMoment,
  LocalizationProvider,
} from "@salt-ds/lab";

const dateAdapterMap: Record<string, any> = {
  moment: AdapterMoment,
  dayjs: AdapterDayjs,
  "date-fns": AdapterDateFns,
  luxon: AdapterLuxon,
};

const getDefaultLocale = (dateAdapter: string) => {
  const isDateFns = dateAdapter === "date-fns";
  const isDayjs = dateAdapter === "dayjs";
  if (isDateFns) {
    return dateFnsEnUs;
  } else if (isDayjs) {
    return "en-US";
  }
  return "en";
};

/** A storybook decorator that provides the Localization context (date support etc.) */
export const withLocalization: Decorator = (Story, context) => {
  const { dateAdapter, dateLocale } = context.parameters;
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

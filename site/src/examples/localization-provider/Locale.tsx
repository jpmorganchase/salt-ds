import {
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  LocalizationProvider,
} from "@salt-ds/lab";
import { type ChangeEventHandler, type ReactElement, useState } from "react";
import "dayjs/locale/en";
import moment from "moment";
import "moment/locale/zh-cn"; // Import the Chinese locale
import { enUS as dateFnsEnUs } from "date-fns/locale";
import "dayjs/locale/zh-cn";
import { zhCN as dateFnsZhCn } from "date-fns/locale";

const US_OPTION = "en";
const CN_OPTION = "zh-CN";

// Moment needs this for the zh-CN locale, as the start of the week is a Monday
moment.updateLocale("zh-cn", {
  week: {
    dow: 1,
  },
});

// biome-ignore lint/suspicious/noExplicitAny: date framework adapter
const dateAdapterMap: Record<string, any> = {
  moment: AdapterMoment,
  dayjs: AdapterDayjs,
  "date-fns": AdapterDateFns,
  luxon: AdapterLuxon,
};

const getDateLocale = (
  selectedAdapter: string,
  selectedLocale: string,
  // biome-ignore lint/suspicious/noExplicitAny: date framework specific
): any => {
  if (selectedAdapter === "date-fns") {
    return selectedLocale === US_OPTION ? dateFnsEnUs : dateFnsZhCn;
  }
  if (selectedAdapter === "luxon") {
    return selectedLocale === US_OPTION ? "en-US" : "zh-CN";
  }
  return selectedLocale === US_OPTION ? "en-us" : "zh-cn";
};

export const Locale = (): ReactElement => {
  const [selectedLocale, setSelectedLocale] =
    useState<keyof typeof dateAdapterMap>(US_OPTION);
  const [selectedAdapter, setSelectedAdapter] =
    useState<keyof typeof dateAdapterMap>("date-fns");

  const onChangeLocaleHandler: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { value } = event.target;
    setSelectedLocale(value);
  };

  const onChangeAdapterHandler: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { value } = event.target;
    setSelectedAdapter(value);
  };
  const locale = getDateLocale(selectedAdapter, selectedLocale);
  const dateAdapter = dateAdapterMap[selectedAdapter];
  return (
    <LocalizationProvider
      key={`${dateAdapter}-${selectedAdapter === "date-fns" ? locale.code : locale}`}
      DateAdapter={dateAdapter}
      locale={locale}
    >
      <FormField>
        <FormFieldLabel>Locale</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          value={selectedLocale}
          onChange={onChangeLocaleHandler}
        >
          <RadioButton label="en" value={US_OPTION} />
          <RadioButton label="zh-cn" value={CN_OPTION} />
        </RadioButtonGroup>
      </FormField>
      <FormField>
        <FormFieldLabel>Adapter</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          value={selectedAdapter}
          onChange={onChangeAdapterHandler}
        >
          <RadioButton label="date-fns" value="date-fns" />
          <RadioButton label="dayjs" value="dayjs" />
          <RadioButton label="luxon" value="luxon" />
          <RadioButton label="moment (legacy)" value="moment" />
        </RadioButtonGroup>
      </FormField>
      <Calendar selectionVariant="single">
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
    </LocalizationProvider>
  );
};

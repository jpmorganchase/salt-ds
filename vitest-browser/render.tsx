import { SaltProvider } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  LocalizationProvider,
  type LocalizationProviderProps,
} from "@salt-ds/date-components";
import type { ReactNode } from "react";
import { render } from "vitest-browser-react";

interface RenderWithSaltOptions<TDate extends DateFrameworkType, TLocale> {
  dateAdapter?: SaltDateAdapter<TDate, TLocale>;
  dateLocale?: TLocale;
}

export function renderWithSalt<
  TDate extends DateFrameworkType = DateFrameworkType,
  TLocale = unknown,
>(
  children: ReactNode,
  { dateAdapter, dateLocale }: RenderWithSaltOptions<TDate, TLocale> = {},
) {
  const content = dateAdapter ? (
    <LocalizationProvider<TDate, TLocale>
      DateAdapter={
        dateAdapter.constructor as LocalizationProviderProps<
          TDate,
          TLocale
        >["DateAdapter"]
      }
      locale={dateLocale}
    >
      {children}
    </LocalizationProvider>
  ) : (
    children
  );

  return render(
    <SaltProvider density="medium" mode="light">
      {content}
    </SaltProvider>,
  );
}

import { SaltProvider } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  LocalizationProvider,
  type LocalizationProviderProps,
} from "@salt-ds/date-components";
import * as React from "react";
import { isValidElement, type ReactNode } from "react";
import { act as reactDomAct } from "react-dom/test-utils";
import { cleanup, render } from "vitest-browser-react";

interface RenderWithSaltOptions<TDate extends DateFrameworkType, TLocale> {
  dateAdapter?: SaltDateAdapter<TDate, TLocale>;
  dateLocale?: TLocale;
}

type PortableStory = {
  globals?: Record<string, unknown>;
};

type ReactWithAct = typeof React & {
  act?: typeof reactDomAct;
  unstable_act?: typeof reactDomAct;
};

const reactAct =
  (React as ReactWithAct).act ??
  (React as ReactWithAct).unstable_act ??
  reactDomAct;

export async function act(callback: () => void | Promise<void>) {
  const actEnvironment = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  };
  const previousEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await reactAct(callback);
  } finally {
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousEnvironment;
  }
}

function setPortableStoryLocalization<TDate extends DateFrameworkType, TLocale>(
  children: ReactNode,
  dateAdapter: SaltDateAdapter<TDate, TLocale> | undefined,
  dateLocale: TLocale | undefined,
) {
  if (!isValidElement(children)) return;

  const story = children.type as PortableStory;
  if (!story.globals) return;

  if (!dateAdapter) {
    delete story.globals.__saltTestLocalization;
    return;
  }

  // Portable stories close over their globals when they are composed. Keep the
  // Storybook localization decorator in sync with the provider below so its
  // nested context cannot shadow the adapter requested by the test.
  story.globals.__saltTestLocalization = {
    DateAdapter: dateAdapter.constructor,
    dateAdapter: dateAdapter.lib,
    dateLocale,
  };
}

export async function renderWithSalt<
  TDate extends DateFrameworkType = DateFrameworkType,
  TLocale = unknown,
>(
  children: ReactNode,
  { dateAdapter, dateLocale }: RenderWithSaltOptions<TDate, TLocale> = {},
) {
  setPortableStoryLocalization(children, dateAdapter, dateLocale);

  // Replace the current tree so tests that render a second scenario do not
  // leave duplicate providers or DOM behind.
  await cleanup();

  function Wrapper({ children: wrappedChildren }: { children: ReactNode }) {
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
        {wrappedChildren}
      </LocalizationProvider>
    ) : (
      wrappedChildren
    );

    return (
      <SaltProvider density="medium" mode="light">
        {content}
      </SaltProvider>
    );
  }

  return render(children, { wrapper: Wrapper });
}

import { useDensity, useTheme } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { useLocalization } from "@salt-ds/date-components";
import { composeStory } from "@storybook/react-vite";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { withLocalization } from "../.storybook/decorators/withLocalization";
import { renderWithSalt } from "./render";

interface LifecycleProbeProps {
  label: string;
  onMount: () => void;
  onUnmount: () => void;
}

function SaltLifecycleProbe({
  label,
  onMount,
  onUnmount,
}: LifecycleProbeProps) {
  const density = useDensity();
  const { mode } = useTheme();

  useEffect(() => {
    onMount();
    return onUnmount;
  }, [onMount, onUnmount]);

  return (
    <div data-density={density} data-mode={mode} data-testid="salt-probe">
      {label}
    </div>
  );
}

function DateLifecycleProbe({
  adapter,
  label,
  onMount,
  onUnmount,
}: LifecycleProbeProps & { adapter: AdapterDayjs }) {
  const { dateAdapter } = useLocalization();

  useEffect(() => {
    onMount();
    return onUnmount;
  }, [onMount, onUnmount]);

  return (
    <div
      data-adapter-type-preserved={
        dateAdapter.constructor === adapter.constructor
      }
      data-testid="date-probe"
    >
      {label}
    </div>
  );
}

function PortableDateProbe() {
  const { dateAdapter } = useLocalization();
  const adapterType =
    dateAdapter instanceof AdapterDateFnsTZ
      ? "date-fns-tz"
      : dateAdapter instanceof AdapterDateFns
        ? "date-fns"
        : dateAdapter instanceof AdapterDayjs
          ? "dayjs"
          : "unknown";
  return <div data-testid="portable-date-probe">{adapterType}</div>;
}

const PortableDateStory = composeStory(
  { render: () => <PortableDateProbe /> },
  { component: PortableDateProbe, title: "Portable date probe" },
  {
    decorators: [withLocalization],
    initialGlobals: { dateAdapter: "luxon" },
  },
);

async function expectPortableStoryAdapter<
  TDate extends DateFrameworkType,
  TLocale,
>(adapter: SaltDateAdapter<TDate, TLocale>, expectedType: string) {
  await renderWithSalt(<PortableDateStory />, { dateAdapter: adapter });

  await expect
    .element(page.getByTestId("portable-date-probe"))
    .toHaveTextContent(expectedType);
}

describe("renderWithSalt", () => {
  it("preserves Salt context and child identity across rerender", async () => {
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const { rerender } = await renderWithSalt(
      <SaltLifecycleProbe
        label="before"
        onMount={onMount}
        onUnmount={onUnmount}
      />,
    );
    const probe = page.getByTestId("salt-probe");

    await expect.element(probe).toHaveAttribute("data-density", "medium");
    await expect.element(probe).toHaveAttribute("data-mode", "light");
    expect(onMount).toHaveBeenCalledOnce();

    await rerender(
      <SaltLifecycleProbe
        label="after"
        onMount={onMount}
        onUnmount={onUnmount}
      />,
    );

    await expect.element(probe).toHaveTextContent("after");
    await expect.element(probe).toHaveAttribute("data-density", "medium");
    await expect.element(probe).toHaveAttribute("data-mode", "light");
    expect(onMount).toHaveBeenCalledOnce();
    expect(onUnmount).not.toHaveBeenCalled();
  });

  it("preserves date context and child identity across rerender", async () => {
    const adapter = new AdapterDayjs();
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const { rerender } = await renderWithSalt(
      <DateLifecycleProbe
        adapter={adapter}
        label="before"
        onMount={onMount}
        onUnmount={onUnmount}
      />,
      { dateAdapter: adapter },
    );
    const probe = page.getByTestId("date-probe");

    await expect
      .element(probe)
      .toHaveAttribute("data-adapter-type-preserved", "true");
    expect(onMount).toHaveBeenCalledOnce();

    await rerender(
      <DateLifecycleProbe
        adapter={adapter}
        label="after"
        onMount={onMount}
        onUnmount={onUnmount}
      />,
    );

    await expect.element(probe).toHaveTextContent("after");
    await expect
      .element(probe)
      .toHaveAttribute("data-adapter-type-preserved", "true");
    expect(onMount).toHaveBeenCalledOnce();
    expect(onUnmount).not.toHaveBeenCalled();
  });

  it("preserves exact adapters inside portable story decorators", async () => {
    await expectPortableStoryAdapter(new AdapterDayjs(), "dayjs");
    await expectPortableStoryAdapter(new AdapterDateFns(), "date-fns");
    await expectPortableStoryAdapter(new AdapterDateFnsTZ(), "date-fns-tz");
  });

  it("replaces the previous tree on a separate helper call", async () => {
    const firstUnmount = vi.fn();
    await renderWithSalt(
      <SaltLifecycleProbe
        label="first"
        onMount={vi.fn()}
        onUnmount={firstUnmount}
      />,
    );

    await expect.element(page.getByText("first")).toBeInTheDocument();

    await renderWithSalt(
      <SaltLifecycleProbe
        label="second"
        onMount={vi.fn()}
        onUnmount={vi.fn()}
      />,
    );

    await expect.element(page.getByText("first")).not.toBeInTheDocument();
    await expect.element(page.getByText("second")).toBeInTheDocument();
    expect(firstUnmount).toHaveBeenCalledOnce();
  });
});

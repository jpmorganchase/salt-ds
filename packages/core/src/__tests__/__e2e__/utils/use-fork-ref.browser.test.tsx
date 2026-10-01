import { useForkRef } from "@salt-ds/core";
import type { Ref } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

function Forked({
  refA,
  refB,
}: {
  refA?: Ref<HTMLDivElement>;
  refB?: Ref<HTMLDivElement>;
}) {
  const handleRef = useForkRef(refA, refB);
  return <div ref={handleRef} />;
}

function createLoggingRef(log: string[], name: string, withCleanup = false) {
  return (node: HTMLDivElement | null) => {
    log.push(node ? `${name}:attach` : `${name}:null`);
    if (withCleanup) {
      return () => {
        log.push(`${name}:cleanup`);
      };
    }
  };
}

// Strict Mode may attach and detach refs an extra time, so assert on balance
// and order rather than exact call counts.
function expectAttached(log: string[], name: string) {
  const attaches = log.filter((entry) => entry === `${name}:attach`).length;
  const detaches = log.filter(
    (entry) => entry === `${name}:null` || entry === `${name}:cleanup`,
  ).length;
  expect(log.filter((entry) => entry.startsWith(`${name}:`)).at(-1)).toBe(
    `${name}:attach`,
  );
  expect(attaches).toBe(detaches + 1);
}

function expectDetached(log: string[], name: string, via: "null" | "cleanup") {
  const attaches = log.filter((entry) => entry === `${name}:attach`).length;
  const detaches = log.filter((entry) => entry === `${name}:${via}`).length;
  expect(log.filter((entry) => entry.startsWith(`${name}:`)).at(-1)).toBe(
    `${name}:${via}`,
  );
  expect(attaches).toBe(detaches);
}

describe("useForkRef", () => {
  it("sets callback and object refs, and clears them on unmount", async () => {
    const log: string[] = [];
    const objectRef: { current: HTMLDivElement | null } = { current: null };

    const { container, unmount } = await render(
      <Forked refA={createLoggingRef(log, "a")} refB={objectRef} />,
    );

    expectAttached(log, "a");
    expect(objectRef.current).toBe(container.firstElementChild);

    await unmount();

    expectDetached(log, "a", "null");
    expect(objectRef.current).toBeNull();
  });

  it("runs the cleanup returned by a callback ref instead of calling it with null", async () => {
    const log: string[] = [];

    const { unmount } = await render(
      <Forked refA={createLoggingRef(log, "a", true)} />,
    );

    expectAttached(log, "a");

    await unmount();

    expectDetached(log, "a", "cleanup");
    expect(log).not.toContain("a:null");
  });

  it("detaches the previous ref when a ref changes", async () => {
    const log: string[] = [];

    const { rerender } = await render(
      <Forked refA={createLoggingRef(log, "a", true)} />,
    );
    await rerender(<Forked refA={createLoggingRef(log, "b")} />);

    expectDetached(log, "a", "cleanup");
    expectAttached(log, "b");
    expect(log.indexOf("a:cleanup")).toBeLessThan(log.lastIndexOf("b:attach"));
  });
});

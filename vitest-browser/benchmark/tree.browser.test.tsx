import {
  Tooltip,
  Tree,
  TreeNode,
  TreeNodeLabel,
  TreeNodeTrigger,
} from "@salt-ds/core";
import { type ComponentProps, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";

const TREE_TYPEAHEAD_RESET_MS = 500;

async function withFakeTimers<T extends { unmount: () => Promise<void> }>(
  render: () => Promise<T>,
  run: () => Promise<void>,
) {
  vi.useFakeTimers();
  try {
    const rendered = await render();
    try {
      await run();
    } finally {
      await rendered.unmount();
      expect(vi.getTimerCount()).toBe(0);
    }
  } finally {
    vi.useRealTimers();
  }
}

const renderSecretFiles = (show = true) =>
  show ? (
    <>
      <TreeNode value="secret-file" label="Secret file" />
      <TreeNode value="secret-folder" label="Secret folder">
        <TreeNode value="nested-secret-file" label="Nested secret file" />
      </TreeNode>
    </>
  ) : null;

function findTreeItem(label: string) {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[role="treeitem"]'),
  ).find(
    (item) =>
      item
        .querySelector(":scope > .saltTreeNodeTrigger .saltTreeNodeLabel")
        ?.textContent?.trim() === label,
  );
}

function treeItem(label: string) {
  const item = findTreeItem(label);
  if (!item) throw new Error(`Tree item "${label}" was not found`);
  return page.elementLocator(item);
}

function treeTrigger(label: string) {
  const trigger = findTreeItem(label)?.querySelector<HTMLElement>(
    ":scope > .saltTreeNodeTrigger",
  );
  if (!trigger) throw new Error(`Tree trigger "${label}" was not found`);
  return page.elementLocator(trigger);
}

function expansionIcon(label: string) {
  const icon = findTreeItem(label)?.querySelector<HTMLElement>(
    ":scope > .saltTreeNodeTrigger .saltTreeNodeExpansionIcon",
  );
  if (!icon) throw new Error(`Expansion icon for "${label}" was not found`);
  return page.elementLocator(icon);
}

async function expectTreeItemAbsent(label: string) {
  await expect.poll(() => findTreeItem(label)).toBeUndefined();
}

function FlatTree(props: Partial<ComponentProps<typeof Tree>> = {}) {
  return (
    <Tree aria-label="File browser" {...props}>
      <TreeNode value="node1" label="Node 1" />
      <TreeNode value="node2" label="Node 2" />
      <TreeNode value="node3" label="Node 3" />
    </Tree>
  );
}

function ParentTree(props: Partial<ComponentProps<typeof Tree>> = {}) {
  return (
    <Tree aria-label="File browser" {...props}>
      <TreeNode value="parent" label="Parent">
        <TreeNode value="child1" label="Child 1" />
        <TreeNode value="child2" label="Child 2" />
      </TreeNode>
      <TreeNode value="sibling" label="Sibling" />
    </Tree>
  );
}

function FragmentTree({
  configDisabled = false,
  ...props
}: Partial<ComponentProps<typeof Tree>> & { configDisabled?: boolean } = {}) {
  return (
    <Tree
      aria-label="File browser"
      defaultExpanded={["project", "config", "secret-folder"]}
      {...props}
    >
      <TreeNode value="project" label="project">
        <TreeNode value="config" label="config" disabled={configDisabled}>
          {renderSecretFiles()}
          <TreeNode value="public-config" label="public.config.ts" />
        </TreeNode>
      </TreeNode>
    </Tree>
  );
}

function ControlledSingle({ fixed = false }: { fixed?: boolean }) {
  const [selected, setSelected] = useState<string[]>(["node1"]);
  return (
    <>
      <button type="button" onClick={() => setSelected(["node2"])}>
        Select Node 2
      </button>
      <button type="button" onClick={() => setSelected([])}>
        Clear Selection
      </button>
      <Tree
        aria-label="File browser"
        selected={selected}
        onSelectionChange={
          fixed ? () => undefined : (_event, value) => setSelected(value)
        }
      >
        <TreeNode value="node1" label="Node 1" />
        <TreeNode value="node2" label="Node 2" />
      </Tree>
    </>
  );
}

function ControlledMultiple({ fixed = false }: { fixed?: boolean }) {
  const [selected, setSelected] = useState<string[]>(["node1"]);
  return (
    <>
      <button
        type="button"
        onClick={() => setSelected(["node1", "node2", "node3"])}
      >
        Select All
      </button>
      <button type="button" onClick={() => setSelected([])}>
        Clear Selection
      </button>
      <Tree
        aria-label="File browser"
        multiselect
        selected={selected}
        onSelectionChange={
          fixed ? () => undefined : (_event, value) => setSelected(value)
        }
      >
        <TreeNode value="node1" label="Node 1" />
        <TreeNode value="node2" label="Node 2" />
        <TreeNode value="node3" label="Node 3" />
      </Tree>
    </>
  );
}

describe("Given a Tree", () => {
  describe("rendering and ARIA", () => {
    it("renders tree and treeitem roles", async () => {
      await renderWithSalt(<FlatTree />);
      await expect
        .element(page.getByRole("tree", { name: "File browser" }))
        .toBeInTheDocument();
      await expect.element(page.getByRole("treeitem")).toHaveLength(3);
    });

    it("only renders aria-expanded on parents and hides collapsed children", async () => {
      await renderWithSalt(<ParentTree />);
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-expanded", "false");
      await expect
        .element(treeItem("Sibling"))
        .not.toHaveAttribute("aria-expanded");
      await expectTreeItemAbsent("Child 1");
    });

    it("supports values with spaces without exposing them as ids", async () => {
      const onExpandedChange = vi.fn();
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <Tree
          aria-label="File browser"
          onExpandedChange={onExpandedChange}
          onSelectionChange={onSelectionChange}
        >
          <TreeNode value="Parent folder" label="Parent Folder">
            <TreeNode value="Nested file one" label="Nested File One" />
          </TreeNode>
        </Tree>,
      );
      await expect
        .element(treeItem("Parent Folder"))
        .not.toHaveAttribute("id", "Parent folder");
      await userEvent.tab();
      await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
      await expect
        .element(treeItem("Nested File One"))
        .toHaveAttribute("aria-selected", "true");
      expect(onExpandedChange.mock.lastCall?.[1]).toEqual(["Parent folder"]);
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Nested file one"]);
    });

    it("sets aria-level for nested nodes", async () => {
      await renderWithSalt(
        <Tree aria-label="File browser" defaultExpanded={["parent", "child"]}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child">
              <TreeNode value="grandchild" label="Grandchild" />
            </TreeNode>
          </TreeNode>
        </Tree>,
      );
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-level", "1");
      await expect
        .element(treeItem("Child"))
        .toHaveAttribute("aria-level", "2");
      await expect
        .element(treeItem("Grandchild"))
        .toHaveAttribute("aria-level", "3");
    });
  });

  describe("keyboard navigation", () => {
    it("moves vertically and supports Home and End", async () => {
      await renderWithSalt(<FlatTree />);
      await userEvent.tab();
      await expect.element(treeItem("Node 1")).toHaveFocus();
      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
      await expect.element(treeItem("Node 3")).toHaveFocus();
      await userEvent.keyboard("{ArrowUp}{Home}");
      await expect.element(treeItem("Node 1")).toHaveFocus();
      await userEvent.keyboard("{End}");
      await expect.element(treeItem("Node 3")).toHaveFocus();
    });

    it("navigates conditionally rendered Fragment descendants", async () => {
      await renderWithSalt(<FragmentTree />);
      await userEvent.tab();
      for (const label of [
        "config",
        "Secret file",
        "Secret folder",
        "Nested secret file",
        "public.config.ts",
      ]) {
        await userEvent.keyboard("{ArrowDown}");
        await expect.element(treeItem(label)).toHaveFocus();
      }
    });

    it("does not navigate into collapsed Fragment descendants", async () => {
      await renderWithSalt(<FragmentTree defaultExpanded={["project"]} />);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
      await expect.element(treeItem("config")).toHaveFocus();
      await expectTreeItemAbsent("Secret file");
    });

    it("expands, enters, returns to and collapses parent nodes", async () => {
      await renderWithSalt(<ParentTree />);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowRight}");
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-expanded", "true");
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(treeItem("Child 1")).toHaveFocus();
      await userEvent.keyboard("{ArrowLeft}");
      await expect.element(treeItem("Parent")).toHaveFocus();
      await userEvent.keyboard("{ArrowLeft}");
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-expanded", "false");
    });

    it.each(["{Enter}", " "])(
      "selects the focused leaf with %s",
      async (key) => {
        const onSelectionChange = vi.fn();
        await renderWithSalt(
          <FlatTree onSelectionChange={onSelectionChange} />,
        );
        await userEvent.tab();
        await userEvent.keyboard(`{ArrowDown}${key}`);
        await expect
          .element(treeItem("Node 2"))
          .toHaveAttribute("aria-selected", "true");
        expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["node2"]);
      },
    );

    it("expands all enabled siblings with the asterisk key", async () => {
      await renderWithSalt(
        <Tree aria-label="File browser">
          <TreeNode value="parent1" label="Parent 1">
            <TreeNode value="child1" label="Child 1" />
          </TreeNode>
          <TreeNode value="parent2" label="Parent 2" disabled>
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
          <TreeNode value="parent3" label="Parent 3">
            <TreeNode value="child3" label="Child 3" />
          </TreeNode>
        </Tree>,
      );
      await userEvent.tab();
      await expect.element(treeItem("Parent 1")).toHaveFocus();
      await userEvent.keyboard("*");
      await expect
        .element(treeItem("Parent 1"))
        .toHaveAttribute("aria-expanded", "true");
      await expect
        .element(treeItem("Parent 2"))
        .toHaveAttribute("aria-expanded", "false");
      await expect
        .element(treeItem("Parent 3"))
        .toHaveAttribute("aria-expanded", "true");
    });

    it("supports single and multi-character type-ahead", async () => {
      await withFakeTimers(
        () =>
          renderWithSalt(
            <Tree aria-label="File browser">
              <TreeNode value="bar" label="Bar" />
              <TreeNode value="baz" label="Baz" />
              <TreeNode value="cherry" label="Cherry" />
            </Tree>,
          ),
        async () => {
          await userEvent.tab();
          await userEvent.keyboard("c");
          await expect.element(treeItem("Cherry")).toHaveFocus();
          await vi.advanceTimersByTimeAsync(TREE_TYPEAHEAD_RESET_MS + 1);
          await userEvent.keyboard("baz");
          await expect.element(treeItem("Baz")).toHaveFocus();
          await vi.advanceTimersByTimeAsync(TREE_TYPEAHEAD_RESET_MS + 1);
        },
      );
    });
  });

  describe("expansion", () => {
    it("toggles through its expansion icon without selecting", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <ParentTree onSelectionChange={onSelectionChange} />,
      );
      await expansionIcon("Parent").click();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-expanded", "true");
      expect(onSelectionChange).not.toHaveBeenCalled();
      await expansionIcon("Parent").click();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-expanded", "false");
    });

    it("supports default and controlled expansion", async () => {
      function ControlledExpansion() {
        const [expanded, setExpanded] = useState<string[]>([]);
        return (
          <>
            <button type="button" onClick={() => setExpanded(["parent"])}>
              Expand
            </button>
            <ParentTree expanded={expanded} />
          </>
        );
      }
      await renderWithSalt(<ParentTree defaultExpanded={["parent"]} />);
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-expanded", "true");
      await renderWithSalt(<ControlledExpansion />);
      await page.getByRole("button", { name: "Expand" }).click();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-expanded", "true");
    });

    it("reports expansion changes", async () => {
      const onExpandedChange = vi.fn();
      await renderWithSalt(<ParentTree onExpandedChange={onExpandedChange} />);
      await expansionIcon("Parent").click();
      expect(onExpandedChange.mock.lastCall?.[1]).toEqual(["parent"]);
    });
  });

  describe("single selection", () => {
    it("selects, replaces and deselects through pointer interaction", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(<FlatTree onSelectionChange={onSelectionChange} />);
      await treeTrigger("Node 1").click();
      await expect
        .element(treeItem("Node 1"))
        .toHaveAttribute("aria-selected", "true");
      await treeTrigger("Node 2").click();
      await expect
        .element(treeItem("Node 1"))
        .not.toHaveAttribute("aria-selected", "true");
      await expect
        .element(treeItem("Node 2"))
        .toHaveAttribute("aria-selected", "true");
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["node2"]);
      await treeTrigger("Node 2").click();
      await expect
        .element(treeItem("Node 2"))
        .not.toHaveAttribute("aria-selected", "true");
    });

    it.each(["default", "controlled"] as const)(
      "clamps %s selection to its first value",
      async (_name) => {
        const props: Partial<ComponentProps<typeof Tree>> =
          _name === "default"
            ? { defaultSelected: ["node1", "node2", "node3"] }
            : { selected: ["node2", "node3"] };
        await renderWithSalt(<FlatTree {...props} />);
        const selected = _name === "default" ? "Node 1" : "Node 2";
        await expect
          .element(treeItem(selected))
          .toHaveAttribute("aria-selected", "true");
        expect(
          document.querySelectorAll('[role="treeitem"][aria-selected="true"]'),
        ).toHaveLength(1);
      },
    );

    it("supports controlled external selection and clearing", async () => {
      await renderWithSalt(<ControlledSingle />);
      await expect
        .element(treeItem("Node 1"))
        .toHaveAttribute("aria-selected", "true");
      await page.getByRole("button", { name: "Select Node 2" }).click();
      await expect
        .element(treeItem("Node 2"))
        .toHaveAttribute("aria-selected", "true");
      await page.getByRole("button", { name: "Clear Selection" }).click();
      await expect
        .element(treeItem("Node 2"))
        .not.toHaveAttribute("aria-selected", "true");
    });

    it("leaves controlled selection unchanged when the parent ignores changes", async () => {
      await renderWithSalt(<ControlledSingle fixed />);
      await treeTrigger("Node 2").click();
      await expect
        .element(treeItem("Node 1"))
        .toHaveAttribute("aria-selected", "true");
      await expect
        .element(treeItem("Node 2"))
        .not.toHaveAttribute("aria-selected", "true");
    });
  });

  describe("multiple selection", () => {
    it("uses multiselect semantics and supports independent selections", async () => {
      await renderWithSalt(<FlatTree multiselect />);
      await expect
        .element(page.getByRole("tree"))
        .toHaveAttribute("aria-multiselectable", "true");
      expect(document.querySelectorAll(".saltTreeNode-checkbox")).toHaveLength(
        3,
      );
      await treeTrigger("Node 1").click();
      await treeTrigger("Node 3").click();
      await expect
        .element(treeItem("Node 1"))
        .toHaveAttribute("aria-checked", "true");
      await expect
        .element(treeItem("Node 3"))
        .toHaveAttribute("aria-checked", "true");
      await expect
        .element(treeItem("Node 1"))
        .not.toHaveAttribute("aria-selected");
    });

    it("selects ranges with Shift+Arrow", async () => {
      await renderWithSalt(<FlatTree multiselect />);
      await userEvent.tab();
      await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
      await expect
        .element(treeItem("Node 2"))
        .toHaveAttribute("aria-checked", "true");
      await expect
        .element(treeItem("Node 3"))
        .toHaveAttribute("aria-checked", "true");
    });

    it("toggles all visible enabled nodes with Ctrl+A", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <FlatTree multiselect onSelectionChange={onSelectionChange} />,
      );
      await userEvent.tab();
      await userEvent.keyboard("{Control>}a{/Control}");
      for (const label of ["Node 1", "Node 2", "Node 3"])
        await expect
          .element(treeItem(label))
          .toHaveAttribute("aria-checked", "true");
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual([
        "node1",
        "node2",
        "node3",
      ]);
      await userEvent.keyboard("{Control>}a{/Control}");
      for (const label of ["Node 1", "Node 2", "Node 3"])
        await expect
          .element(treeItem(label))
          .not.toHaveAttribute("aria-checked", "true");
    });

    it("Ctrl+A excludes collapsed descendants", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <ParentTree multiselect onSelectionChange={onSelectionChange} />,
      );
      await userEvent.tab();
      await userEvent.keyboard("{Control>}a{/Control}");
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual([
        "parent",
        "sibling",
      ]);
      await expansionIcon("Parent").click();
      await expect
        .element(treeItem("Child 1"))
        .not.toHaveAttribute("aria-checked", "true");
    });

    it("propagates parent selection and deselection to descendants", async () => {
      await renderWithSalt(<ParentTree multiselect />);
      await treeTrigger("Parent").click();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-checked", "true");
      await expansionIcon("Parent").click();
      for (const label of ["Child 1", "Child 2"])
        await expect
          .element(treeItem(label))
          .toHaveAttribute("aria-checked", "true");
      await expansionIcon("Parent").click();
      await treeTrigger("Parent").click();
      await expansionIcon("Parent").click();
      for (const label of ["Child 1", "Child 2"])
        await expect
          .element(treeItem(label))
          .not.toHaveAttribute("aria-checked", "true");
    });

    it("marks ancestors mixed and fully selected as children change", async () => {
      await renderWithSalt(
        <ParentTree multiselect defaultExpanded={["parent"]} />,
      );
      await treeTrigger("Child 1").click();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-checked", "mixed");
      await treeTrigger("Child 2").click();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-checked", "true");
    });

    it("preserves mixed state while descendant DOM is collapsed", async () => {
      await renderWithSalt(
        <Tree
          aria-label="File browser"
          multiselect
          defaultExpanded={["grandparent", "parent"]}
        >
          <TreeNode value="grandparent" label="Grandparent">
            <TreeNode value="parent" label="Parent">
              <TreeNode value="deep1" label="Deep 1" />
              <TreeNode value="deep2" label="Deep 2" />
            </TreeNode>
            <TreeNode value="sibling" label="Sibling" />
          </TreeNode>
        </Tree>,
      );
      await treeTrigger("Deep 1").click();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-checked", "mixed");
      await expansionIcon("Parent").click();
      await expectTreeItemAbsent("Deep 1");
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-checked", "mixed");
      await expansionIcon("Grandparent").click();
      await expectTreeItemAbsent("Parent");
      await expansionIcon("Grandparent").click();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-checked", "mixed");
    });

    it("propagates Fragment selections, disabled state and defaults", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <FragmentTree multiselect onSelectionChange={onSelectionChange} />,
      );
      await treeTrigger("Secret folder").click();
      await expect
        .element(treeItem("Secret folder"))
        .toHaveAttribute("aria-checked", "true");
      await expect
        .element(treeItem("Nested secret file"))
        .toHaveAttribute("aria-checked", "true");
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual([
        "secret-folder",
        "nested-secret-file",
      ]);

      await renderWithSalt(
        <FragmentTree
          multiselect
          defaultExpanded={["project"]}
          defaultSelected={["secret-folder"]}
        />,
      );
      await expect
        .element(treeItem("config"))
        .toHaveAttribute("aria-checked", "mixed");
      await expansionIcon("config").click();
      await expect
        .element(treeItem("Secret folder"))
        .toHaveAttribute("aria-checked", "true");

      await renderWithSalt(<FragmentTree configDisabled />);
      for (const label of [
        "Secret file",
        "Secret folder",
        "Nested secret file",
      ])
        await expect
          .element(treeItem(label))
          .toHaveAttribute("aria-disabled", "true");
    });

    it("supports controlled external selection, Ctrl+A and clearing", async () => {
      await renderWithSalt(<ControlledMultiple />);
      await page.getByRole("button", { name: "Select All" }).click();
      for (const label of ["Node 1", "Node 2", "Node 3"])
        await expect
          .element(treeItem(label))
          .toHaveAttribute("aria-checked", "true");
      await page.getByRole("button", { name: "Clear Selection" }).click();
      for (const label of ["Node 1", "Node 2", "Node 3"])
        await expect
          .element(treeItem(label))
          .not.toHaveAttribute("aria-checked", "true");

      await renderWithSalt(<ControlledMultiple />);
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.keyboard("{Control>}a{/Control}");
      await expect
        .element(treeItem("Node 3"))
        .toHaveAttribute("aria-checked", "true");
    });

    it("leaves controlled multiselect unchanged when changes are ignored", async () => {
      await renderWithSalt(<ControlledMultiple fixed />);
      await treeTrigger("Node 2").click();
      await expect
        .element(treeItem("Node 1"))
        .toHaveAttribute("aria-checked", "true");
      await expect
        .element(treeItem("Node 2"))
        .not.toHaveAttribute("aria-checked", "true");
    });
  });

  describe("disabled state", () => {
    it("disables the entire tree", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <FlatTree disabled onSelectionChange={onSelectionChange} />,
      );
      await expect
        .element(page.getByRole("tree"))
        .toHaveAttribute("aria-disabled", "true");
      await treeTrigger("Node 1").click({ force: true });
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("focuses but does not select disabled nodes", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" disabled />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      await expect
        .element(treeItem("Node 2"))
        .toHaveAttribute("aria-disabled", "true");
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}");
      await expect.element(treeItem("Node 2")).toHaveFocus();
      await userEvent.keyboard("{Enter} ");
      expect(onSelectionChange).not.toHaveBeenCalled();
      await userEvent.keyboard("{ArrowDown}");
      await expect.element(treeItem("Node 3")).toHaveFocus();
    });

    it("does not expand disabled parents but navigates their pre-expanded children", async () => {
      const onExpandedChange = vi.fn();
      await renderWithSalt(
        <Tree aria-label="File browser" onExpandedChange={onExpandedChange}>
          <TreeNode value="parent" label="Parent" disabled>
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      await userEvent.tab();
      await userEvent.keyboard("{ArrowRight}");
      expect(onExpandedChange).not.toHaveBeenCalled();
      await expect
        .element(treeItem("Parent"))
        .toHaveAttribute("aria-expanded", "false");

      await renderWithSalt(
        <Tree aria-label="File browser" defaultExpanded={["parent"]}>
          <TreeNode value="parent" label="Parent" disabled>
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}");
      await expect.element(treeItem("Child")).toHaveFocus();
    });

    it("excludes disabled nodes from Ctrl+A", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <Tree
          aria-label="File browser"
          multiselect
          onSelectionChange={onSelectionChange}
        >
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" disabled />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      await userEvent.tab();
      await userEvent.keyboard("{Control>}a{/Control}");
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["node1", "node3"]);
    });
  });

  describe("focus management", () => {
    it.each([
      ["single without selection", false, [] as string[], "Node 1"],
      ["single with selection", false, ["node2"], "Node 2"],
      ["multiple without selection", true, [] as string[], "Node 1"],
      ["multiple with selection", true, ["node2", "node3"], "Node 2"],
    ])(
      "focuses the expected entry target for %s",
      async (_name, multiselect, selected, target) => {
        await renderWithSalt(
          <FlatTree multiselect={multiselect} defaultSelected={selected} />,
        );
        await userEvent.tab();
        await expect.element(treeItem(target)).toHaveFocus();
      },
    );

    it.each([
      ["single", false, ["node2"]],
      ["multiple", true, ["node2", "node3"]],
    ])(
      "restores the selected target when re-entering a %s tree",
      async (_name, multiselect, selected) => {
        await renderWithSalt(
          <>
            <button type="button">Before</button>
            <FlatTree multiselect={multiselect} defaultSelected={selected} />
            <button type="button">After</button>
          </>,
        );
        await page.getByRole("button", { name: "Before" }).click();
        await userEvent.tab();
        await expect.element(treeItem("Node 2")).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}{Tab}");
        await expect
          .element(page.getByRole("button", { name: "After" }))
          .toHaveFocus();
        await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
        await expect.element(treeItem("Node 2")).toHaveFocus();
      },
    );

    it("uses the first visible item when selected descendants are collapsed", async () => {
      await renderWithSalt(
        <Tree
          aria-label="File browser"
          multiselect
          defaultSelected={["child1", "child3"]}
        >
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="parent1" label="Parent 1">
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
          <TreeNode value="parent2" label="Parent 2">
            <TreeNode value="child3" label="Child 3" />
            <TreeNode value="child4" label="Child 4" />
          </TreeNode>
        </Tree>,
      );
      await userEvent.tab();
      await expect.element(treeItem("Node 1")).toHaveFocus();
    });
  });

  describe("tooltips and trigger events", () => {
    function TooltipTree({ nested = false }: { nested?: boolean }) {
      return (
        <Tree
          aria-label="File browser"
          defaultExpanded={nested ? ["documents", "reports"] : []}
        >
          <TreeNode value="documents">
            <Tooltip content="Documents tooltip" placement="right">
              <TreeNodeTrigger>
                <TreeNodeLabel>Documents</TreeNodeLabel>
              </TreeNodeTrigger>
            </Tooltip>
            {nested ? (
              <TreeNode value="reports">
                <Tooltip content="Reports tooltip" placement="right">
                  <TreeNodeTrigger>
                    <TreeNodeLabel>Reports</TreeNodeLabel>
                  </TreeNodeTrigger>
                </Tooltip>
                <TreeNode value="annual" label="Annual Report" />
              </TreeNode>
            ) : null}
          </TreeNode>
          <TreeNode value="pictures" label="Pictures" />
        </Tree>
      );
    }

    it.each(["hover", "focus"])(
      "shows a node tooltip on %s",
      async (interaction) => {
        await renderWithSalt(<TooltipTree />);
        if (interaction === "hover") await treeTrigger("Documents").hover();
        else await userEvent.tab();
        await expect
          .element(page.getByRole("tooltip"))
          .toHaveTextContent("Documents tooltip");
      },
    );

    it("hides and swaps tooltips as focus moves", async () => {
      await renderWithSalt(<TooltipTree nested />);
      await userEvent.tab();
      await expect
        .element(page.getByRole("tooltip"))
        .toHaveTextContent("Documents tooltip");
      await userEvent.keyboard("{ArrowDown}");
      await expect
        .element(page.getByRole("tooltip"))
        .toHaveTextContent("Reports tooltip");
      await userEvent.keyboard("{ArrowDown}");
      await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
      await userEvent.keyboard("{ArrowUp}");
      await expect
        .element(page.getByRole("tooltip"))
        .toHaveTextContent("Reports tooltip");
    });

    it("only forwards focus and blur for the directly focused trigger", async () => {
      const documentsFocus = vi.fn();
      const documentsBlur = vi.fn();
      const reportsFocus = vi.fn();
      const reportsBlur = vi.fn();
      await renderWithSalt(
        <Tree
          aria-label="File browser"
          defaultExpanded={["documents", "reports"]}
        >
          <TreeNode value="documents">
            <TreeNodeTrigger onFocus={documentsFocus} onBlur={documentsBlur}>
              <TreeNodeLabel>Documents</TreeNodeLabel>
            </TreeNodeTrigger>
            <TreeNode value="reports">
              <TreeNodeTrigger onFocus={reportsFocus} onBlur={reportsBlur}>
                <TreeNodeLabel>Reports</TreeNodeLabel>
              </TreeNodeTrigger>
              <TreeNode value="annual" label="Annual Report" />
            </TreeNode>
          </TreeNode>
        </Tree>,
      );
      await userEvent.tab();
      expect(documentsFocus).toHaveBeenCalledTimes(1);
      expect(reportsFocus).not.toHaveBeenCalled();
      await userEvent.keyboard("{ArrowDown}");
      expect(documentsBlur).toHaveBeenCalledTimes(1);
      expect(reportsFocus).toHaveBeenCalledTimes(1);
      await userEvent.keyboard("{ArrowDown}{ArrowUp}");
      expect(reportsBlur).toHaveBeenCalledTimes(1);
      expect(reportsFocus).toHaveBeenCalledTimes(2);
    });
  });
});

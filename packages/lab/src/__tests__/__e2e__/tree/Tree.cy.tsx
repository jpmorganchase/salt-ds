import { Tooltip } from "@salt-ds/core";
import { Tree, TreeNode, TreeNodeLabel, TreeNodeTrigger } from "@salt-ds/lab";
import { useState } from "react";

describe("Given a Tree", () => {
  describe("Basic Rendering and ARIA Structure", () => {
    it("should render with tree role", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("tree").should("exist");
    });

    it("should render treeitems", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findAllByRole("treeitem").should("have.length", 2);
    });

    it("should render aria-expanded only on parent nodes", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
          <TreeNode value="leaf" label="Leaf" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.findByRole("treeitem", { name: /Leaf/ }).should(
        "not.have.attr",
        "aria-expanded",
      );
    });

    it("should render aria-level correctly for nested nodes", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultExpanded={["parent", "child"]}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child">
              <TreeNode value="grandchild" label="Grandchild" />
            </TreeNode>
          </TreeNode>
        </Tree>,
      );
      // Use attribute selectors since nested treeitems cause accessible name to include child text
      cy.get('[role="treeitem"][aria-level="1"]')
        .should("have.length", 1)
        .and("contain.text", "Parent");
      cy.get('[role="treeitem"][aria-level="2"]')
        .should("have.length", 1)
        .and("contain.text", "Child");
      cy.get('[role="treeitem"][aria-level="3"]')
        .should("have.length", 1)
        .and("contain.text", "Grandchild");
    });
  });

  describe("Keyboard Navigation", () => {
    it("should move focus down with ArrowDown", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
    });

    it("should move focus up with ArrowUp", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
      cy.realPress("ArrowUp");
      cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      cy.realPress("ArrowUp");
      cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
    });

    it("should expand collapsed node with ArrowRight", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.realPress("ArrowRight");
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
    });

    it("should move to first child with ArrowRight when expanded", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultExpanded={["parent"]}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: /Parent/ }).should("be.focused");
      cy.realPress("ArrowRight");
      cy.findByRole("treeitem", { name: "Child" }).should("be.focused");
    });

    it("should collapse expanded node with ArrowLeft", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultExpanded={["parent"]}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.realPress("ArrowLeft");
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
    });

    it("should move to parent with ArrowLeft when collapsed", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultExpanded={["parent"]}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Child" }).should("be.focused");
      cy.realPress("ArrowLeft");
      cy.findByRole("treeitem", { name: /Parent/ }).should("be.focused");
    });

    it("should jump to first node with Home", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("End");
      cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
      cy.realPress("Home");
      cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
    });

    it("should jump to last visible node with End", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      cy.realPress("End");
      cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
    });

    it("should select focused node with Enter", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.realPress("Enter");
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["node2"],
      );
    });

    it("should select focused node with Space", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.realPress("Space");
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["node2"],
      );
    });

    it("should select with Space on leaf node", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="leaf" label="Leaf" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("Space");
      cy.findByRole("treeitem", { name: "Leaf" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.get("@selectionChangeHandler").should("have.been.called");
    });

    it("should expand all siblings with * key", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="parent1" label="Parent 1">
            <TreeNode value="child1" label="Child 1" />
          </TreeNode>
          <TreeNode value="parent2" label="Parent 2">
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
          <TreeNode value="parent3" label="Parent 3">
            <TreeNode value="child3" label="Child 3" />
          </TreeNode>
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: /Parent 1/ }).should("be.focused");
      // cy.realPress doesn't support * character, use native event
      cy.findByRole("tree").then(($tree) => {
        $tree[0].dispatchEvent(
          new KeyboardEvent("keydown", { key: "*", bubbles: true }),
        );
      });
      cy.findByRole("treeitem", { name: /Parent 1/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("treeitem", { name: /Parent 2/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("treeitem", { name: /Parent 3/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
    });

    it("should focus node matching typed characters", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="apple" label="Apple" />
          <TreeNode value="banana" label="Banana" />
          <TreeNode value="cherry" label="Cherry" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realType("c");
      cy.findByRole("treeitem", { name: "Cherry" }).should("be.focused");
    });

    it("should support multi-character type-ahead", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="bar" label="Bar" />
          <TreeNode value="baz" label="Baz" />
          <TreeNode value="foo" label="Foo" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realType("ba");
      cy.findByRole("treeitem", { name: "Bar" }).should("be.focused");
      cy.wait(600); // wait for type-ahead timeout
      cy.realType("baz");
      cy.findByRole("treeitem", { name: "Baz" }).should("be.focused");
    });
  });

  describe("Expansion Behavior", () => {
    it("should expand/collapse when clicking expansion icon", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.get(".saltTreeNodeExpansionIcon").realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.get(".saltTreeNodeExpansionIcon").realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
    });

    it("should render with defaultExpanded nodes expanded", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultExpanded={["parent"]}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("treeitem", { name: "Child" }).should("be.visible");
    });

    it("should support controlled expanded prop", () => {
      const ControlledTree = () => {
        const [expanded, setExpanded] = useState<string[]>([]);
        return (
          <>
            <button
              type="button"
              onClick={() => setExpanded(["parent"])}
              data-testid="expand-btn"
            >
              Expand
            </button>
            <Tree aria-label="File browser" expanded={expanded}>
              <TreeNode value="parent" label="Parent">
                <TreeNode value="child" label="Child" />
              </TreeNode>
            </Tree>
          </>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.findByTestId("expand-btn").realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
    });

    it("should call onExpandedChange when expansion changes", () => {
      const onExpandedChange = cy.stub().as("expandedChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onExpandedChange={onExpandedChange}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.get(".saltTreeNodeExpansionIcon").realClick();
      cy.get("@expandedChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["parent"],
      );
    });
  });

  describe("Selection - Single Select (default)", () => {
    it("should select node on click", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should set aria-selected on selected node", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultSelected={["node2"]}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should call onSelectionChange with selected value", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 2" }).realClick();
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["node2"],
      );
    });

    it("should replace selection when clicking another node", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should deselect on re-click in single-select mode", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should clamp defaultSelected to first item when not multiselect", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          defaultSelected={["node1", "node2", "node3"]}
        >
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should clamp controlled selected to first item when not multiselect", () => {
      cy.mount(
        <Tree aria-label="File browser" selected={["node2", "node3"]}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
    });
  });

  describe("Selection - Multi-Select", () => {
    it("should allow multiple nodes to be selected", () => {
      cy.mount(
        <Tree aria-label="File browser" multiselect>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.findByRole("treeitem", { name: "Node 3" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should set aria-multiselectable on tree", () => {
      cy.mount(
        <Tree aria-label="File browser" multiselect>
          <TreeNode value="node1" label="Node 1" />
        </Tree>,
      );
      cy.findByRole("tree").should("have.attr", "aria-multiselectable", "true");
    });

    it("should render checkboxes", () => {
      cy.mount(
        <Tree aria-label="File browser" multiselect>
          <TreeNode value="node1" label="Node 1" />
        </Tree>,
      );
      cy.get(".saltTreeNode-checkbox").should("exist");
    });

    it("should use aria-checked instead of aria-selected", () => {
      cy.mount(
        <Tree aria-label="File browser" multiselect defaultSelected={["node1"]}>
          <TreeNode value="node1" label="Node 1" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-selected",
      );
    });

    it("should select range with Shift+Arrow", () => {
      cy.mount(
        <Tree aria-label="File browser" multiselect>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress(["Shift", "ArrowDown"]);
      cy.realPress(["Shift", "ArrowDown"]);
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should select all visible with Ctrl+A", () => {
      cy.mount(
        <Tree aria-label="File browser" multiselect>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress(["Control", "a"]);
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should deselect all with Ctrl+A when all are selected", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          defaultSelected={["node1", "node2", "node3"]}
        >
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress(["Control", "a"]);
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should show indeterminate state when partially selected", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          defaultExpanded={["parent"]}
          defaultSelected={["child1"]}
        >
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
        </Tree>,
      );
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-checked",
        "mixed",
      );
    });

    it("should select with Space regardless of node type", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          onSelectionChange={onSelectionChange}
        >
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("Space");
      cy.get("@selectionChangeHandler").should("have.been.called");
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should propagate selection to descendants", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          defaultExpanded={["parent"]}
        >
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
        </Tree>,
      );
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNodeTrigger")
        .first()
        .realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Child 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Child 2" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should auto-select parent when all children selected", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          defaultExpanded={["parent"]}
        >
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Child 1" }).realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-checked",
        "mixed",
      );
      cy.findByRole("treeitem", { name: "Child 2" }).realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should propagate selection to collapsed children when expanded", () => {
      cy.mount(
        <Tree aria-label="File browser" multiselect>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
        </Tree>,
      );
      // Select collapsed parent
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNodeTrigger")
        .first()
        .realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      // Children not yet visible
      cy.findByRole("treeitem", { name: "Child 1" }).should("not.exist");

      // Expand parent - children should sync to selected
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNodeExpansionIcon")
        .realClick();
      cy.findByRole("treeitem", { name: "Child 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Child 2" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should propagate deselection to collapsed children when expanded", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          defaultExpanded={["parent"]}
          defaultSelected={["parent", "child1", "child2"]}
        >
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
        </Tree>,
      );
      // All selected initially
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Child 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );

      // Collapse parent
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNodeExpansionIcon")
        .realClick();
      cy.findByRole("treeitem", { name: "Child 1" }).should("not.exist");

      // Deselect collapsed parent
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNodeTrigger")
        .first()
        .realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );

      // Expand parent - children should sync to deselected
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNodeExpansionIcon")
        .realClick();
      cy.findByRole("treeitem", { name: "Child 1" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Child 2" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
    });
  });

  describe("Controlled Selection - Single Select", () => {
    it("should render with controlled selected prop", () => {
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>(["node2"]);
        return (
          <Tree
            aria-label="File browser"
            selected={selected}
            onSelectionChange={(_event, newSelected) =>
              setSelected(newSelected)
            }
          >
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
            <TreeNode value="node3" label="Node 3" />
          </Tree>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should update selection through external state change", () => {
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>([]);
        return (
          <>
            <button
              type="button"
              onClick={() => setSelected(["node2"])}
              data-testid="select-btn"
            >
              Select Node 2
            </button>
            <Tree
              aria-label="File browser"
              selected={selected}
              onSelectionChange={(_event, newSelected) =>
                setSelected(newSelected)
              }
            >
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="node2" label="Node 2" />
              <TreeNode value="node3" label="Node 3" />
            </Tree>
          </>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
      cy.findByTestId("select-btn").realClick();
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should not change selection if parent doesn't update state", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      const ControlledTree = () => {
        // Intentionally not updating state - selection should remain fixed
        const [selected] = useState<string[]>(["node1"]);
        return (
          <Tree
            aria-label="File browser"
            selected={selected}
            onSelectionChange={onSelectionChange}
          >
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
          </Tree>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      // Click on Node 2 - should fire callback but not change selection
      cy.findByRole("treeitem", { name: "Node 2" }).realClick();
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["node2"],
      );
      // Selection should still be Node 1 since state wasn't updated
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should call onSelectionChange with correct value on keyboard selection", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>([]);
        return (
          <Tree
            aria-label="File browser"
            selected={selected}
            onSelectionChange={(event, newSelected) => {
              onSelectionChange(event, newSelected);
              setSelected(newSelected);
            }}
          >
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
          </Tree>
        );
      };
      cy.mount(<ControlledTree />);
      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.realPress("Enter");
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["node2"],
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should allow clearing selection externally", () => {
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>(["node1"]);
        return (
          <>
            <button
              type="button"
              onClick={() => setSelected([])}
              data-testid="clear-btn"
            >
              Clear Selection
            </button>
            <Tree
              aria-label="File browser"
              selected={selected}
              onSelectionChange={(_event, newSelected) =>
                setSelected(newSelected)
              }
            >
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="node2" label="Node 2" />
            </Tree>
          </>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.findByTestId("clear-btn").realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
    });
  });

  describe("Controlled Selection - Multi-Select", () => {
    it("should render with controlled selected prop", () => {
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>(["node1", "node3"]);
        return (
          <Tree
            aria-label="File browser"
            multiselect
            selected={selected}
            onSelectionChange={(_event, newSelected) =>
              setSelected(newSelected)
            }
          >
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
            <TreeNode value="node3" label="Node 3" />
          </Tree>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should update selection through external state change", () => {
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>([]);
        return (
          <>
            <button
              type="button"
              onClick={() => setSelected(["node1", "node2", "node3"])}
              data-testid="select-all-btn"
            >
              Select All
            </button>
            <Tree
              aria-label="File browser"
              multiselect
              selected={selected}
              onSelectionChange={(_event, newSelected) =>
                setSelected(newSelected)
              }
            >
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="node2" label="Node 2" />
              <TreeNode value="node3" label="Node 3" />
            </Tree>
          </>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
      cy.findByTestId("select-all-btn").realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should not change selection if parent doesn't update state", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      const ControlledTree = () => {
        // Intentionally not updating state - selection should remain fixed
        const [selected] = useState<string[]>(["node1"]);
        return (
          <Tree
            aria-label="File browser"
            multiselect
            selected={selected}
            onSelectionChange={onSelectionChange}
          >
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
          </Tree>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      // Click on Node 2 - should fire callback but not change selection
      cy.findByRole("treeitem", { name: "Node 2" }).realClick();
      cy.get("@selectionChangeHandler").should("have.been.called");
      // Selection should still be only Node 1 since state wasn't updated
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should handle Ctrl+A with controlled selection", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>([]);
        return (
          <Tree
            aria-label="File browser"
            multiselect
            selected={selected}
            onSelectionChange={(event, newSelected) => {
              onSelectionChange(event, newSelected);
              setSelected(newSelected);
            }}
          >
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
            <TreeNode value="node3" label="Node 3" />
          </Tree>
        );
      };
      cy.mount(<ControlledTree />);
      cy.realPress("Tab");
      cy.realPress(["Control", "a"]);
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["node1", "node2", "node3"],
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should show indeterminate state with controlled selection", () => {
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>(["child1"]);
        return (
          <Tree
            aria-label="File browser"
            multiselect
            defaultExpanded={["parent"]}
            selected={selected}
            onSelectionChange={(_event, newSelected) =>
              setSelected(newSelected)
            }
          >
            <TreeNode value="parent" label="Parent">
              <TreeNode value="child1" label="Child 1" />
              <TreeNode value="child2" label="Child 2" />
            </TreeNode>
          </Tree>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-checked",
        "mixed",
      );
      cy.findByRole("treeitem", { name: "Child 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Child 2" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should allow clearing selection externally", () => {
      const ControlledTree = () => {
        const [selected, setSelected] = useState<string[]>([
          "node1",
          "node2",
          "node3",
        ]);
        return (
          <>
            <button
              type="button"
              onClick={() => setSelected([])}
              data-testid="clear-btn"
            >
              Clear Selection
            </button>
            <Tree
              aria-label="File browser"
              multiselect
              selected={selected}
              onSelectionChange={(_event, newSelected) =>
                setSelected(newSelected)
              }
            >
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="node2" label="Node 2" />
              <TreeNode value="node3" label="Node 3" />
            </Tree>
          </>
        );
      };
      cy.mount(<ControlledTree />);
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByTestId("clear-btn").realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
    });
  });

  describe("Uncontrolled Selection", () => {
    it("should work without onSelectionChange callback", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultSelected={["node1"]}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      // Should still allow interaction
      cy.findByRole("treeitem", { name: "Node 2" }).realClick();
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should call onSelectionChange when provided but manage state internally", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["node1"],
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should respect defaultSelected on initial render", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultSelected={["node2"]}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "not.have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should respect defaultSelected for multiselect on initial render", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          defaultSelected={["node1", "node3"]}
        >
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    it("should allow selection changes in uncontrolled multiselect mode", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          onSelectionChange={onSelectionChange}
        >
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.get("@selectionChangeHandler").should("have.been.calledTwice");
    });
  });

  describe("Disabled States", () => {
    it("should prevent all interaction when tree is disabled", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree
          aria-label="File browser"
          disabled
          onSelectionChange={onSelectionChange}
        >
          <TreeNode value="node1" label="Node 1" />
        </Tree>,
      );
      cy.findByRole("tree").should("have.attr", "aria-disabled", "true");
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.get("@selectionChangeHandler").should("not.have.been.called");
    });

    it("should set aria-disabled on disabled nodes", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" disabled />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-disabled",
        "true",
      );
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "not.have.attr",
        "aria-disabled",
      );
    });

    it("should not select disabled nodes on click", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="node1" label="Node 1" disabled />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.get("@selectionChangeHandler").should("not.have.been.called");
    });

    it("should focus disabled nodes during keyboard navigation", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" disabled />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
    });

    it("should not select disabled nodes via Enter or Space", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" disabled />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      cy.realPress("Enter");
      cy.get("@selectionChangeHandler").should("not.have.been.called");
      cy.realPress(" ");
      cy.get("@selectionChangeHandler").should("not.have.been.called");
    });

    it("should not expand disabled parent nodes via ArrowRight", () => {
      const onExpandedChange = cy.stub().as("expandedChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onExpandedChange={onExpandedChange}>
          <TreeNode value="parent1" label="Parent 1" disabled>
            <TreeNode value="child1" label="Child 1" />
          </TreeNode>
          <TreeNode value="parent2" label="Parent 2">
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: /Parent 1/ }).should("be.focused");
      cy.realPress("ArrowRight");
      cy.get("@expandedChangeHandler").should("not.have.been.called");
      cy.findByRole("treeitem", { name: /Parent 1/ }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
    });

    it("should navigate to children of an expanded disabled parent", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultExpanded={["parent1"]}>
          <TreeNode value="parent1" label="Parent 1" disabled>
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: /Parent 1/ }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Child 1" }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Child 2" }).should("be.focused");
    });

    it("should not include disabled nodes in Ctrl+A selection", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
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
      cy.realPress("Tab");
      cy.realPress(["Control", "a"]);
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["node1", "node3"],
      );
    });

    it("should not expand disabled siblings with * key", () => {
      cy.mount(
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
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: /Parent 1/ }).should("be.focused");
      cy.findByRole("tree").then(($tree) => {
        $tree[0].dispatchEvent(
          new KeyboardEvent("keydown", { key: "*", bubbles: true }),
        );
      });
      cy.findByRole("treeitem", { name: /Parent 1/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("treeitem", { name: /Parent 3/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.findByRole("treeitem", { name: /Parent 2/ }).should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.findByRole("treeitem", { name: "Child 2" }).should("not.exist");
    });
  });

  describe("Mouse Interaction", () => {
    it("should select and focus node on click", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 2" }).realClick();
      cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      cy.findByRole("treeitem", { name: "Node 2" }).should(
        "have.attr",
        "aria-selected",
        "true",
      );
    });

    it("should expand without selecting when clicking expansion icon", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree aria-label="File browser" onSelectionChange={onSelectionChange}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.get(".saltTreeNodeExpansionIcon").realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.get("@selectionChangeHandler").should("not.have.been.called");
    });

    it("should move focus to clicked node", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).realClick();
      cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      cy.findByRole("treeitem", { name: "Node 3" }).realClick();
      cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
    });
  });

  describe("Focus Selection Management (ARIA compliance tests)", () => {
    describe("Single-select mode", () => {
      it("should focus first node when tabbing into tree with no selection", () => {
        cy.mount(
          <Tree aria-label="File browser">
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
            <TreeNode value="node3" label="Node 3" />
          </Tree>,
        );
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      });

      it("should focus selected node when tabbing into tree with selection", () => {
        cy.mount(
          <Tree aria-label="File browser" defaultSelected={["node2"]}>
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
            <TreeNode value="node3" label="Node 3" />
          </Tree>,
        );
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      });

      it("should allow tabbing out from any focused node without refocusing selected node", () => {
        cy.mount(
          <>
            <Tree aria-label="File browser" defaultSelected={["node2"]}>
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="node2" label="Node 2" />
              <TreeNode value="node3" label="Node 3" />
            </Tree>
            <button type="button">Next Element</button>
          </>,
        );
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
        cy.realPress("ArrowDown");
        cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
        cy.realPress("Tab");
        cy.findByRole("button", { name: "Next Element" }).should("be.focused");
      });

      it("should return focus to selected node when tabbing back into tree", () => {
        cy.mount(
          <>
            <button type="button">Previous Element</button>
            <Tree aria-label="File browser" defaultSelected={["node2"]}>
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="node2" label="Node 2" />
              <TreeNode value="node3" label="Node 3" />
            </Tree>
            <button type="button">Next Element</button>
          </>,
        );
        cy.findByRole("button", { name: "Previous Element" }).focus();
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
        cy.realPress("ArrowDown");
        cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
        cy.realPress("Tab");
        cy.findByRole("button", { name: "Next Element" }).should("be.focused");
        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      });

      it("should focus first visible node when selected node is hidden by collapsed parent", () => {
        cy.mount(
          <Tree aria-label="File browser" defaultSelected={["child"]}>
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="parent" label="Parent">
              <TreeNode value="child" label="Child" />
            </TreeNode>
            <TreeNode value="node3" label="Node 3" />
          </Tree>,
        );
        cy.findByRole("tree").should("exist");
        cy.findByRole("treeitem", { name: "Node 1" }).should("exist");
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      });
    });

    describe("Multi-select mode", () => {
      it("should focus first node when tabbing into tree with no selection", () => {
        cy.mount(
          <Tree aria-label="File browser" multiselect>
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
            <TreeNode value="node3" label="Node 3" />
          </Tree>,
        );
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      });

      it("should focus first selected node when tabbing into tree with selection", () => {
        cy.mount(
          <Tree
            aria-label="File browser"
            multiselect
            defaultSelected={["node2", "node3"]}
          >
            <TreeNode value="node1" label="Node 1" />
            <TreeNode value="node2" label="Node 2" />
            <TreeNode value="node3" label="Node 3" />
          </Tree>,
        );
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      });

      it("should allow tabbing out from any focused node without refocusing selected nodes", () => {
        cy.mount(
          <>
            <Tree
              aria-label="File browser"
              multiselect
              defaultSelected={["node1", "node2"]}
            >
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="node2" label="Node 2" />
              <TreeNode value="node3" label="Node 3" />
            </Tree>
            <button type="button">Next Element</button>
          </>,
        );
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
        cy.realPress("ArrowDown");
        cy.realPress("ArrowDown");
        cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
        cy.realPress("Tab");
        cy.findByRole("button", { name: "Next Element" }).should("be.focused");
      });

      it("should return focus to first selected node when tabbing back into tree", () => {
        cy.mount(
          <>
            <button type="button">Previous Element</button>
            <Tree
              aria-label="File browser"
              multiselect
              defaultSelected={["node2", "node3"]}
            >
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="node2" label="Node 2" />
              <TreeNode value="node3" label="Node 3" />
            </Tree>
            <button type="button">Next Element</button>
          </>,
        );
        cy.findByRole("button", { name: "Previous Element" }).focus();
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
        cy.realPress("ArrowUp");
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
        cy.realPress("Tab");
        cy.findByRole("button", { name: "Next Element" }).should("be.focused");
        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("treeitem", { name: "Node 2" }).should("be.focused");
      });

      it("should focus first visible node when all selected nodes are hidden by collapsed parents", () => {
        cy.mount(
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
        cy.findByRole("tree").should("exist");
        cy.findByRole("treeitem", { name: "Node 1" }).should("exist");
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      });

      it("should update focus target as nested selected nodes become visible through expansion", () => {
        cy.mount(
          <>
            <button type="button">Previous Element</button>
            <Tree
              aria-label="File browser"
              multiselect
              defaultExpanded={["grandparent", "parent"]}
              defaultSelected={["deepChild1"]}
            >
              <TreeNode value="node1" label="Node 1" />
              <TreeNode value="grandparent" label="Grandparent">
                <TreeNode value="parent" label="Parent">
                  <TreeNode value="deepChild1" label="Deep Child 1" />
                  <TreeNode value="deepChild2" label="Deep Child 2" />
                  <TreeNode value="deepChild3" label="Deep Child 3" />
                </TreeNode>
                <TreeNode value="sibling" label="Sibling" />
              </TreeNode>
              <TreeNode value="node3" label="Node 3" />
            </Tree>
            <button type="button">Next Element</button>
          </>,
        );

        // Use aria-level to disambiguate nested treeitems with overlapping text
        const getParentNode = () =>
          cy
            .get('[role="treeitem"][aria-level="2"]')
            .filter(":contains(Parent)");
        const getGrandparentNode = () =>
          cy
            .get('[role="treeitem"][aria-level="1"]')
            .filter(":contains(Grandparent)");

        // Initially expanded - selected node is visible
        cy.findByRole("tree").should("exist");
        cy.findByRole("button", { name: "Previous Element" }).focus();
        cy.realPress("Tab");
        cy.findByRole("treeitem", { name: "Deep Child 1" }).should(
          "be.focused",
        );

        // Collapse parent (second level) - selected node now hidden
        getParentNode().find(".saltTreeNodeExpansionIcon").realClick();
        cy.findByRole("treeitem", { name: "Deep Child 1" }).should("not.exist");

        // Tab out and back in - should focus first node since selected is hidden
        cy.realPress("Tab");
        cy.findByRole("button", { name: "Next Element" }).should("be.focused");
        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");

        // Collapse grandparent (first level) - parent also hidden now
        getGrandparentNode().find(".saltTreeNodeExpansionIcon").realClick();
        cy.get('[role="treeitem"][aria-level="2"]').should("not.exist");

        // Tab out and back in - should still focus first node
        cy.realPress("Tab");
        cy.findByRole("button", { name: "Next Element" }).should("be.focused");
        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");

        // Expand grandparent (first level) - parent visible but still indeterminate
        getGrandparentNode().find(".saltTreeNodeExpansionIcon").realClick();
        getParentNode().should("be.visible");
        getParentNode().should("have.attr", "aria-checked", "mixed");
        cy.findByRole("treeitem", { name: "Deep Child 1" }).should("not.exist");

        // Tab out and back in - should still focus first node (selected still hidden)
        cy.realPress("Tab");
        cy.findByRole("button", { name: "Next Element" }).should("be.focused");
        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");

        // Expand parent (second level) - selected node now visible
        getParentNode().find(".saltTreeNodeExpansionIcon").realClick();
        cy.findByRole("treeitem", { name: "Deep Child 1" }).should(
          "be.visible",
        );

        // Tab out and back in - should now focus the selected node
        cy.realPress("Tab");
        cy.findByRole("button", { name: "Next Element" }).should("be.focused");
        cy.realPress(["Shift", "Tab"]);
        cy.findByRole("treeitem", { name: "Deep Child 1" }).should(
          "be.focused",
        );
      });
    });
  });

  describe("Tooltip Integration", () => {
    it("should show tooltip when hovering a node with tooltip", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="documents">
            <Tooltip content="Contains all document files" placement="right">
              <TreeNodeTrigger>
                <TreeNodeLabel>Documents</TreeNodeLabel>
              </TreeNodeTrigger>
            </Tooltip>
          </TreeNode>
          <TreeNode value="pictures" label="Pictures" />
        </Tree>,
      );
      cy.findByRole("tooltip").should("not.exist");
      cy.findByRole("treeitem", { name: "Documents" }).realHover();
      cy.findByRole("tooltip").should("be.visible");
      cy.findByRole("tooltip").should(
        "have.text",
        "Contains all document files",
      );
    });

    it("should show tooltip when focusing a node with tooltip", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="documents">
            <Tooltip content="Contains all document files" placement="right">
              <TreeNodeTrigger>
                <TreeNodeLabel>Documents</TreeNodeLabel>
              </TreeNodeTrigger>
            </Tooltip>
          </TreeNode>
          <TreeNode value="pictures" label="Pictures" />
        </Tree>,
      );
      cy.findByRole("tooltip").should("not.exist");
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: "Documents" }).should("be.focused");
      cy.findByRole("tooltip").should("be.visible");
      cy.findByRole("tooltip").should(
        "have.text",
        "Contains all document files",
      );
    });

    it("should hide tooltip when focus moves away from the node", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="documents">
            <Tooltip content="Documents tooltip" placement="right">
              <TreeNodeTrigger>
                <TreeNodeLabel>Documents</TreeNodeLabel>
              </TreeNodeTrigger>
            </Tooltip>
          </TreeNode>
          <TreeNode value="pictures" label="Pictures" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("tooltip").should("be.visible");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Pictures" }).should("be.focused");
      cy.findByRole("tooltip").should("not.exist");
    });

    it("should show tooltip on hover for parent node with children", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultExpanded={["documents"]}>
          <TreeNode value="documents">
            <Tooltip content="Main documents folder" placement="right">
              <TreeNodeTrigger>
                <TreeNodeLabel>Documents</TreeNodeLabel>
              </TreeNodeTrigger>
            </Tooltip>
            <TreeNode value="reports" label="Reports" />
            <TreeNode value="invoices" label="Invoices" />
          </TreeNode>
        </Tree>,
      );
      cy.findByRole("tooltip").should("not.exist");
      // Hover over the trigger span (Tooltip's ref target), not the outer li
      cy.get('[role="treeitem"][aria-level="1"]')
        .find(".saltTreeNodeTrigger")
        .realHover();
      cy.findByRole("tooltip").should("be.visible");
      cy.findByRole("tooltip").should("have.text", "Main documents folder");
    });

    it("should show tooltip on focus for parent node with children", () => {
      cy.mount(
        <Tree aria-label="File browser" defaultExpanded={["documents"]}>
          <TreeNode value="documents">
            <Tooltip content="Main documents folder" placement="right">
              <TreeNodeTrigger>
                <TreeNodeLabel>Documents</TreeNodeLabel>
              </TreeNodeTrigger>
            </Tooltip>
            <TreeNode value="reports" label="Reports" />
            <TreeNode value="invoices" label="Invoices" />
          </TreeNode>
        </Tree>,
      );
      cy.findByRole("tooltip").should("not.exist");
      cy.realPress("Tab");
      // Use aria-level to target the parent node specifically
      cy.get('[role="treeitem"][aria-level="1"]').should("be.focused");
      cy.findByRole("tooltip").should("be.visible");
      cy.findByRole("tooltip").should("have.text", "Main documents folder");
    });
  });
});

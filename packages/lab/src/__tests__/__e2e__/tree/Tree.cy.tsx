import { Tree, TreeNode } from "@salt-ds/lab";
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
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-level",
        "1",
      );
      cy.findByRole("treeitem", { name: /Child/ }).should(
        "have.attr",
        "aria-level",
        "2",
      );
      cy.findByRole("treeitem", { name: /Grandchild/ }).should(
        "have.attr",
        "aria-level",
        "3",
      );
    });

    it("should render aria-labelledby pointing to label", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" id="test-node" />
        </Tree>,
      );
      cy.findByRole("treeitem", { name: "Node 1" }).should(
        "have.attr",
        "aria-labelledby",
        "test-node-label",
      );
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
      cy.get(".saltTreeNode-expansion").realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.get(".saltTreeNode-expansion").realClick();
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
      cy.get(".saltTreeNode-expansion").realClick();
      cy.get("@expandedChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["parent"],
      );
    });

    it("should call onNodeExpandChange when node is expanded", () => {
      const onNodeExpandChange = cy.stub().as("expandHandler");
      cy.mount(
        <Tree aria-label="File browser" onNodeExpandChange={onNodeExpandChange}>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child" label="Child" />
          </TreeNode>
        </Tree>,
      );
      cy.get(".saltTreeNode-expansion").realClick();
      cy.get("@expandHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        "parent",
        true,
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

    it("should propagate selection to descendants with propagateSelect", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          propagateSelect
          defaultExpanded={["parent"]}
        >
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
        </Tree>,
      );
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNode-content")
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

    it("should auto-select parent when all children selected with propagateSelectUpwards", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          propagateSelectUpwards
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

    it("should propagate selection to collapsed children when expanded with propagateSelect", () => {
      cy.mount(
        <Tree aria-label="File browser" multiselect propagateSelect>
          <TreeNode value="parent" label="Parent">
            <TreeNode value="child1" label="Child 1" />
            <TreeNode value="child2" label="Child 2" />
          </TreeNode>
        </Tree>,
      );
      // Select collapsed parent
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNode-content")
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
        .find(".saltTreeNode-expansion")
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

    it("should propagate deselection to collapsed children when expanded with propagateSelect", () => {
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          propagateSelect
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
        .find(".saltTreeNode-expansion")
        .realClick();
      cy.findByRole("treeitem", { name: "Child 1" }).should("not.exist");

      // Deselect collapsed parent
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNode-content")
        .first()
        .realClick();
      cy.findByRole("treeitem", { name: /Parent/ }).should(
        "not.have.attr",
        "aria-checked",
        "true",
      );

      // Expand parent - children should sync to deselected
      cy.findByRole("treeitem", { name: /Parent/ })
        .find(".saltTreeNode-expansion")
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

    it("should support disabledIds prop", () => {
      cy.mount(
        <Tree aria-label="File browser" disabledIds={["node1", "node3"]}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
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
      cy.findByRole("treeitem", { name: "Node 3" }).should(
        "have.attr",
        "aria-disabled",
        "true",
      );
    });

    it("should skip disabled nodes during keyboard navigation via disabledIDs", () => {
      cy.mount(
        <Tree aria-label="File browser" disabledIds={["node2"]}>
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.findByRole("treeitem", { name: "Node 1" }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
    });

    it("should skip disabled nodes during keyboard navigation via disabled prop on node", () => {
      cy.mount(
        <Tree aria-label="File browser">
          <TreeNode value="node1" label="Node 1" disabled />
          <TreeNode value="node2" label="Node 2" />
          <TreeNode value="node3" label="Node 3" />
        </Tree>,
      );
      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.findByRole("treeitem", { name: "Node 3" }).should("be.focused");
    });

    it("should not include disabled nodes in Ctrl+A selection", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      cy.mount(
        <Tree
          aria-label="File browser"
          multiselect
          disabledIds={["node2"]}
          onSelectionChange={onSelectionChange}
        >
          <TreeNode value="node1" label="Node 1" />
          <TreeNode value="node2" label="Node 2" />
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
      cy.get(".saltTreeNode-expansion").realClick();
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
});
